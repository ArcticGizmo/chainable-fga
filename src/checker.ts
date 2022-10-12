import { OpenFgaApi } from '@openfga/sdk';
import type { TupleKey, CheckRequest } from '@openfga/sdk';

interface QueryOptions {
  authorizationModelId?: string;
}

class IncompleteTupleError extends Error {
  constructor() {
    super('Tuple must have all fields populated [user, object, relation]');
    this.name = this.constructor.name;
  }
}

class RelationNotFoundError extends Error {
  constructor(relation?: string) {
    super(`Relation '${relation}' not found`);
    this.name = this.constructor.name;
  }
}

class InvalidObjectFormatError extends Error {
  constructor(obj?: string) {
    super(`Invalid object format '${obj}'. Must be 'type:id'`);
    this.name = this.constructor.name;
  }
}

class ObjectTypeNotFoundError extends Error {
  constructor(type?: string) {
    super(`Object type '${type}' not found`);
    this.name = this.constructor.name;
  }
}

export class Checker {
  private _fga: OpenFgaApi;

  constructor(fga: OpenFgaApi) {
    this._fga = fga;
  }

  check(tuple?: TupleKey, contextualTuples?: TupleKey[]) {
    return new Check(this._fga, tuple, contextualTuples);
  }
}

class Check {
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

  async is(bool: true, opts?: QueryOptions) {
    const resp = await this.query(opts);
    return resp === bool;
  }

  isValid() {
    return this._user && this._object && this._relation;
  }

  validate() {
    if (this.isValid()) {
      return;
    }

    throw new IncompleteTupleError();
  }

  toTuple(): TupleKey {
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
