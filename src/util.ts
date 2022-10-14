import {
  IncompleteTupleError,
  IncompleteTypeTupleError,
  InvalidObjectFormatError,
  InvalidTypeFormatError
} from './errors';
import { PartialTuple, PartialTypeTuple } from './types';

export function isValidTuple(tuple: PartialTuple) {
  return tuple.user && tuple.relation && tuple.object && tuple.object.includes(':');
}

export function isValidTypeTuple(tuple: PartialTypeTuple) {
  return tuple.user && tuple.relation && tuple.type && !tuple.type.includes(':');
}

export function validateTuple(tuple: PartialTuple) {
  const isValid = isValidTuple(tuple);

  if (isValid) {
    return;
  }

  if (tuple.object && !tuple.object.includes(':')) {
    throw new InvalidObjectFormatError();
  }

  throw new IncompleteTupleError(tuple);
}

export function validateTypeTuple(tuple: PartialTypeTuple) {
  const isValid = isValidTypeTuple(tuple);

  if (isValid) {
    return;
  }

  if (tuple.type && tuple.type.includes(':')) {
    throw new InvalidTypeFormatError();
  }

  throw new IncompleteTypeTupleError(tuple);
}
