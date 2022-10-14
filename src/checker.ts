import { OpenFgaApi } from '@openfga/sdk';
import type { TupleKey, CheckRequest } from '@openfga/sdk';
import {
  IncompleteTupleError,
  InvalidObjectFormatError,
  ObjectTypeNotFoundError,
  RelationNotFoundError
} from './errors';
import { CompleteTuple, PartialTuple } from './types';

interface QueryOptions {
  authorizationModelId?: string;
}

export class Checker {
  private _fga: OpenFgaApi;

  constructor(fga: OpenFgaApi) {
    this._fga = fga;
  }

  check(tuple?: CompleteTuple, contextualTuples?: TupleKey[]) {
    return new CheckChain(this._fga, tuple, contextualTuples);
  }
}

export class CheckChain {
  private _fga: OpenFgaApi;
  private _user?: string;
  private _object?: string;
  private _relation?: string;
  private _contextualTuples: TupleKey[] = [];

  constructor(fga: OpenFgaApi, tuple?: TupleKey, contextualTuples: TupleKey[] = []) {
    this._fga = fga;
    this._user = tuple?.user;
    this._object = tuple?.object;
    this._relation = tuple?.relation;
    this._contextualTuples = contextualTuples;
  }

  async query(opts?: QueryOptions) {
    this.validate();
    const tuple = this.toTuple();
    const req: CheckRequest = {
      tuple_key: tuple,
      authorization_model_id: opts?.authorizationModelId
    };

    if (this._contextualTuples.length) {
      req.contextual_tuples = { tuple_keys: this._contextualTuples };
    }

    try {
      const resp = await this._fga.check(req);
      return resp.allowed || false;
      // eslint-disable-next-line
    } catch (error: any) {
      const code = error?.responseData?.code as string;

      switch (code) {
        case 'relation_not_found':
          throw new RelationNotFoundError(tuple.relation);

        case 'invalid_object_format':
          throw new InvalidObjectFormatError(tuple.object);

        case 'type_not_found':
          throw new ObjectTypeNotFoundError(tuple.object);

        default:
          throw error;
      }
    }
  }

  isValid() {
    return this._user && this._object && this._relation;
  }

  validate() {
    if (this.isValid()) {
      return;
    }

    throw new IncompleteTupleError(this.toTuple());
  }

  toTuple(): PartialTuple {
    return {
      user: this._user,
      object: this._object,
      relation: this._relation
    };
  }

  user(user: string) {
    this._user = user;
    return this;
  }

  withUser(user: string) {
    this._user = user;
    return this;
  }

  anyone() {
    this._user = '*';
    return this;
  }

  object(obj: string) {
    this._object = obj;
    return this;
  }

  withObject(obj: string) {
    this._object = obj;
    return this;
  }

  hasRelation(relation: string) {
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
