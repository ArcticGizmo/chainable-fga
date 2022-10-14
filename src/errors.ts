import { PartialTuple, PartialTypeTuple } from './types';

export class IncompleteTupleError extends Error {
  constructor(tuple: PartialTuple) {
    super(`Tuple must have all fields populated [user, object, relation], got
    user: '${tuple.user}'
    object: '${tuple.object}'
    relation: '${tuple.relation}'
    `);
    this.name = this.constructor.name;
  }
}

export class IncompleteTypeTupleError extends Error {
  constructor(tuple: PartialTypeTuple) {
    super(`Type tuple must have all fields populated [user, type, relation] got
    user: '${tuple.user}'
    type: '${tuple.type}'
    relation: '${tuple.relation}'
    `);
    this.name = this.constructor.name;
  }
}

export class RelationNotFoundError extends Error {
  constructor(relation?: string) {
    super(`Relation '${relation}' not found`);
    this.name = this.constructor.name;
  }
}

export class InvalidObjectFormatError extends Error {
  constructor(obj?: string) {
    super(`Invalid object format '${obj}'. Must be 'type:id'`);
    this.name = this.constructor.name;
  }
}

export class InvalidTypeFormatError extends Error {
  constructor(obj?: string) {
    super(`Invalid type format '${obj}'. Must not include :`);
    this.name = this.constructor.name;
  }
}

export class ObjectTypeNotFoundError extends Error {
  constructor(type?: string) {
    super(`Object type '${type}' not found`);
    this.name = this.constructor.name;
  }
}

export class TransactionError extends Error {
  constructor(code: string, message: string) {
    const parsedMessage = message.replaceAll('&#39;', "'");
    super(`${code}: ${parsedMessage}`);
    this.name = this.constructor.name;
  }
}
