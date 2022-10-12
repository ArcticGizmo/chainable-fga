export class IncompleteTupleError extends Error {
  constructor() {
    super('Tuple must have all fields populated [user, object, relation]');
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

export class ObjectTypeNotFoundError extends Error {
  constructor(type?: string) {
    super(`Object type '${type}' not found`);
    this.name = this.constructor.name;
  }
}
