import { ListObjectsRequest, OpenFgaApi } from '@openfga/sdk';
import type { ReadRequest, TupleKey } from '@openfga/sdk';
import { IncompleteTypeTupleError } from './errors';

type ReadOpts = Omit<ReadRequest, 'tuple_key'>;

interface ConcreteTupleKey {
  user: string;
  object: string;
  relation: string;
}

interface TypeTuple {
  user: string;
  type: string;
  relation: string;
}

interface UserReq {
  relation: string;
  object: string;
}

interface RelationReq {
  user: string;
  object: string;
}

interface ObjectReq {
  user: string;
  type: string;
  relation: string;
}

interface FinderResp {
  continuation_token?: string;
}

interface UserRes extends FinderResp {
  users: string[];
}

interface RelationRes extends FinderResp {
  relations: string[];
}

interface ObjectRes extends FinderResp {
  objects: string[];
}

interface TupleResp {
  key: ConcreteTupleKey;
  timestamp: string;
}

interface FinderReadResp {
  tuples: TupleResp[];
  continuation_token?: string;
}

export class Finder {
  private _fga: OpenFgaApi;

  constructor(fga: OpenFgaApi) {
    this._fga = fga;
  }

  async find(tuple: TupleKey, opts?: ReadOpts): Promise<FinderReadResp> {
    const resp = await this._fga.read({ ...opts, tuple_key: tuple });
    const tuples = (resp.tuples || []).map(t => {
      return {
        key: t.key as ConcreteTupleKey,
        timestamp: t.timestamp as string
      };
    });

    return { tuples, continuation_token: resp.continuation_token };
  }

  async users(req: UserReq, opts?: ReadOpts): Promise<UserRes> {
    const resp = await this.find(req, opts);
    const users = resp.tuples.map(t => t.key.user);
    return { users, continuation_token: resp.continuation_token };
  }

  async relations(req: RelationReq, opts?: ReadOpts): Promise<RelationRes> {
    const resp = await this.find(req, opts);
    const relations = resp.tuples.map(t => t.key.relation);
    return { relations, continuation_token: resp.continuation_token };
  }

  async objects(req: ObjectReq, contextualTuples?: TupleKey[]) {
    const body: ListObjectsRequest = { ...req };
    if (contextualTuples?.length) {
      body.contextual_tuples = { tuple_keys: contextualTuples };
    }
    const resp = await this._fga.listObjects(body);
    return resp.object_ids as string[];
  }

  findObjects() {
    return new ObjectChain(this._fga);
  }
}

class ObjectChain {
  private _fga: OpenFgaApi;
  private _user?: string;
  private _type?: string;
  private _relation?: string;
  private _contextualTuples: TupleKey[] = [];

  constructor(fga: OpenFgaApi) {
    this._fga = fga;
  }

  isValid() {
    return this._user && this._type && this._relation;
  }

  validate() {
    if (this.isValid()) {
      return;
    }

    throw new IncompleteTypeTupleError();
  }

  toTypeTuple() {
    return {
      user: this._user,
      type: this._type,
      relation: this._relation
    };
  }

  async query() {
    this.validate();
    const typeTuple = this.toTypeTuple();
    const req: ListObjectsRequest = { ...typeTuple };
    if (this._contextualTuples.length) {
      req.contextual_tuples = { tuple_keys: this._contextualTuples };
    }

    const resp = await this._fga.listObjects(req);
    return resp.object_ids as string[];
  }

  ofType(type: string) {
    this._type = type;
    return this;
  }

  forUser(user: string) {
    this._user = user;
    return this;
  }

  forAnyone() {
    this._user = '*';
    return this;
  }

  withRelation(relation: string) {
    this._relation = relation;
    return this;
  }

  withContext(keyOrKeys: TupleKey | TupleKey[]) {
    this._contextualTuples = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    return this;
  }

  addContext(key: TupleKey) {
    this._contextualTuples.push(key);
    return this;
  }
}
