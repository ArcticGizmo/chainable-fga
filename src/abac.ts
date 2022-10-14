import { ListObjectsRequest, OpenFgaApi, TupleKey } from '@openfga/sdk';
import { CheckChain } from './checker';
import { Finder } from './finder';
import { WriterTransaction } from './writer';

interface AbacConfiguration {
  type: string;
  relation: string;
}

interface AbacWriterCommitOptions {
  modelId: string;
}

interface Attributes {
  [key: string]: string | boolean;
}

function attrsEqual(a: Attributes, b: Attributes) {
  const keys1 = Object.keys(a);
  const keys2 = Object.keys(b);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

function parseAttribute(key: string, value?: string): [string, string | boolean] {
  const [attr, maybeValue] = key.split('=');
  const actualValue = (maybeValue || value) ?? true;
  return [attr, actualValue];
}

function toAttrObject(type: string, key: string, value?: string) {
  const [attr, actualvalue] = parseAttribute(key, value);
  if (!actualvalue || actualvalue === true) {
    return `${type}:${attr}`;
  }
  return `${type}:${attr}|${actualvalue}`;
}

export class Abac {
  private _fga: OpenFgaApi;
  private _type: string;
  private _relation: string;
  constructor(fga: OpenFgaApi, config: AbacConfiguration = { type: 'attribute', relation: 'assigned' }) {
    this._fga = fga;
    this._type = config.type;
    this._relation = config.relation;
  }

  check() {
    return new AbacCheckChain(this._fga, this._type, this._relation);
  }

  findAttributes() {
    return new AbacFindChain(this._fga, this._type, this._relation);
  }

  modifyAttributes() {
    return new AbacWriterChain(this._fga, this._type, this._relation);
  }
}

class AbacCheckChain {
  private _fga: OpenFgaApi;
  private _type: string;
  private _relation: string;
  private _user?: string;
  private _attributes: Attributes = {};
  private _contextualTuples: TupleKey[] = [];

  constructor(fga: OpenFgaApi, type: string, relation: string) {
    this._fga = fga;
    this._type = type;
    this._relation = relation;
  }

  user(user: string) {
    this._user = user;
    return this;
  }

  hasAttr(key: string, value?: string) {
    const [attr, actualValue] = parseAttribute(key, value);
    this._attributes[attr] = actualValue;
    return this;
  }

  hasAttributes(attributes: string[]) {
    attributes.forEach(a => {
      const [attr, value] = parseAttribute(a);
      this._attributes[attr] = value;
    });
    return this;
  }

  withContext(keyOrKeys: TupleKey | TupleKey[]) {
    this._contextualTuples = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    return this;
  }

  async query() {
    const len = Object.keys(this._attributes).length;
    if (len === 0) {
      return false;
    }

    const attrs = await new AbacFindChain(this._fga, this._type, this._relation).forUser(this._user as string).query();

    return attrsEqual(attrs, this._attributes);
  }
}

class AbacFindChain {
  private _fga: OpenFgaApi;
  private _type: string;
  private _relation: string;
  private _user?: string;
  private _contextualTuples: TupleKey[] = [];

  constructor(fga: OpenFgaApi, type: string, relation: string) {
    this._fga = fga;
    this._type = type;
    this._relation = relation;
  }

  forUser(user: string) {
    this._user = user;
    return this;
  }

  withContext(keyOrKeys: TupleKey | TupleKey[]) {
    this._contextualTuples = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    return this;
  }

  async query() {
    const body: ListObjectsRequest = { user: this._user, type: this._type, relation: this._relation };
    if (this._contextualTuples?.length) {
      body.contextual_tuples = { tuple_keys: this._contextualTuples };
    }
    const resp = await this._fga.listObjects(body);
    const objectIds = resp.object_ids as string[];
    return objectIds.reduce((acc, id) => {
      const [attr, value] = id.split('|');
      acc[attr] = value ?? true;
      return acc;
    }, {} as Attributes);
  }
}

class AbacWriterChain {
  private _fga: OpenFgaApi;
  private _type: string;
  private _relation: string;
  private _user?: string;
  private _addAttributes: string[] = [];
  private _removeAttributes: string[] = [];

  constructor(fga: OpenFgaApi, type: string, relation: string) {
    this._fga = fga;
    this._type = type;
    this._relation = relation;
  }

  async commit(opts?: AbacWriterCommitOptions) {
    // TODO: it might be worth having some configure to ignore existing attribute
    // first pull all attributes for the user
    // filter the add and remove lists
    const toAdd = this._addAttributes.map(attr => {
      return {
        user: this._user,
        relation: this._relation,
        object: attr
      };
    });

    const toDelete = this._removeAttributes.map(attr => {
      return {
        user: this._user,
        relation: this._relation,
        object: attr
      };
    });

    return new WriterTransaction(this._fga).set(toAdd, toDelete).commit(opts?.modelId);
  }

  forUser(user: string) {
    this._user = user;
    return this;
  }

  add(key: string, value?: string) {
    const attrObject = toAttrObject(this._type, key, value);
    this._addAttributes.push(attrObject);
    return this;
  }

  remove(key: string, value?: string) {
    const attrObject = toAttrObject(this._type, key, value);
    this._removeAttributes.push(attrObject);
    return this;
  }
}
