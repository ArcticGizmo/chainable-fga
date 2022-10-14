import { ListObjectsRequest, OpenFgaApi, TupleKey } from '@openfga/sdk';
import { CheckChain } from './checker';

interface RbacConfiguration {
  type: string;
  relation: string;
}

export class Rbac {
  private _fga: OpenFgaApi;
  private _type: string;
  private _relation: string;
  constructor(fga: OpenFgaApi, config: RbacConfiguration = { type: 'role', relation: 'assigned' }) {
    this._fga = fga;
    this._type = config.type;
    this._relation = config.relation;
  }

  check() {
    return new RbacCheckChain(this._fga, this._type, this._relation);
  }

  findRoles() {
    return new RbacFindChain(this._fga, this._type, this._relation);
  }

  createRole(role: string) {
    // use writer
    throw 'Not implemented';
  }
}

class RbacCheckChain {
  private _fga: OpenFgaApi;
  private _type: string;
  private _relation: string;
  private _user?: string;
  private _object?: string;
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

  hasRole(role: string) {
    this._object = `${this._type}:${role}`;
    return this;
  }

  withContext(keyOrKeys: TupleKey | TupleKey[]) {
    this._contextualTuples = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    return this;
  }

  async query() {
    const tuple = {
      user: this._user,
      object: this._object,
      relation: this._relation
    };
    return new CheckChain(this._fga, tuple).query();
  }
}

class RbacFindChain {
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
    return resp.object_ids as string[];
  }
}
