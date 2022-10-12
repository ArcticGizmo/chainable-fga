import { OpenFgaApi } from '@openfga/sdk';
import type { ReadRequest, TupleKey } from '@openfga/sdk';

type ReadOpts = Omit<ReadRequest, 'tuple_key'>;

interface ConcreteTupleKey {
  user: string;
  object: string;
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

  async objects(req: ObjectReq, opts?: ReadOpts): Promise<ObjectRes> {
    const parsedReq: ConcreteTupleKey = {
      user: req.user,
      object: `${req.type}:`,
      relation: req.relation
    };
    const resp = await this.find(parsedReq, opts);
    const objects = resp.tuples.map(t => t.key.object);
    return { objects, continuation_token: resp.continuation_token };
  }
}
