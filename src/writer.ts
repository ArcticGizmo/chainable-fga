import { OpenFgaApi, WriteRequest } from '@openfga/sdk';
import { TransactionError } from './errors';
import { CompleteTuple, PartialTuple } from './types';
import { validateTuple } from './util';

type TransactionEntry = (composer: TupleComposer) => TupleComposer;

interface TransactionResponse {
  added: CompleteTuple[];
  deleted: CompleteTuple[];
}

export class Writer {
  private _fga: OpenFgaApi;
  constructor(fga: OpenFgaApi) {
    this._fga = fga;
  }

  transaction() {
    return new WriterTransaction(this._fga);
  }
}

export class WriterTransaction {
  private _fga: OpenFgaApi;
  private _pendingWrites: PartialTuple[] = [];
  private _pendingDeletes: PartialTuple[] = [];

  constructor(fga: OpenFgaApi) {
    this._fga = fga;
  }

  async commit(modelId?: string): Promise<TransactionResponse> {
    this._pendingWrites.map(validateTuple);
    this._pendingDeletes.map(validateTuple);

    const req: WriteRequest = { authorization_model_id: modelId };

    if (this._pendingWrites.length) {
      req.writes = { tuple_keys: this._pendingWrites };
    }

    if (this._pendingDeletes.length) {
      req.deletes = { tuple_keys: this._pendingDeletes };
    }

    try {
      await this._fga.write(req);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.statusCode === 400) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = error?.responseData as any;
        throw new TransactionError(data.code as string, data.message as string);
      }

      throw error;
    }

    const resp = {
      added: this._pendingWrites as CompleteTuple[],
      deleted: this._pendingDeletes as CompleteTuple[]
    };

    this._pendingWrites = [];
    this._pendingDeletes = [];

    return resp;
  }

  set(toAdd: PartialTuple[], toDelete: PartialTuple[]) {
    this._pendingWrites = toAdd;
    this._pendingDeletes = toDelete;
    return this;
  }

  add(callback: TransactionEntry) {
    const composer = new TupleComposer(this._fga);
    this._pendingWrites.push(callback(composer).toTuple());
    return this;
  }

  addTuple(tuple: CompleteTuple) {
    this._pendingWrites.push(tuple);
    return this;
  }

  delete(callback: TransactionEntry) {
    const composer = new TupleComposer(this._fga);
    this._pendingDeletes.push(callback(composer).toTuple());
    return this;
  }

  deleteTuple(tuple: CompleteTuple) {
    this._pendingDeletes.push(tuple);
    return this;
  }
}

export class TupleComposer {
  private _fga: OpenFgaApi;

  private _user?: string;
  private _object?: string;
  private _relation?: string;

  constructor(fga: OpenFgaApi) {
    this._fga = fga;
  }

  user(user: string) {
    this._user = user;
    return this;
  }

  everyone() {
    this._user = '*';
    return this;
  }

  withRelation(relation: string) {
    this._relation = relation;
    return this;
  }

  toObject(object: string) {
    this._object = object;
    return this;
  }

  toTuple(): PartialTuple {
    return {
      user: this._user,
      relation: this._relation,
      object: this._object
    };
  }
}
