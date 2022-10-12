import '../src/env';
import { Checker } from '../src/checker';
import { InvalidObjectFormatError, ObjectTypeNotFoundError, RelationNotFoundError } from '../src/errors';
import { MockOpenFgaApi } from './__mocks__/openFgaApi';

const checker = new Checker(MockOpenFgaApi());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAsync = (prom: Promise<any>) => {
  return expect(async () => await prom).rejects;
};

describe('Query', () => {
  test('Valid check', async () => {
    const resp = await checker.check().user('anne').hasRelation('owner').withObject('itinerary:0001').query();
    expect(resp).toBe(true);
  });

  test('invalid relation', async () => {
    const prom = checker.check().object('itinerary:0001').hasRelation('__invalid__').withUser('anne').query();
    await expectAsync(prom).toThrow(RelationNotFoundError);
  });

  test('invalid type', async () => {
    const prom = checker.check().object('__invalid__:001').hasRelation('owner').withUser('anne').query();
    await expectAsync(prom).toThrow(ObjectTypeNotFoundError);
  });

  test('invalid object format', async () => {
    const prom = checker.check().object('__invalid__').hasRelation('owner').withUser('anne').query();
    await expectAsync(prom).toThrow(InvalidObjectFormatError);
  });
});

describe('Construction', () => {
  test('user', () => {
    const value = 'a';
    const tuple = checker.check().user(value).toTuple();
    expect(tuple.user).toBe(value);
  });

  test('withUser', () => {
    const value = 'a';
    const tuple = checker.check().withUser(value).toTuple();
    expect(tuple.user).toBe(value);
  });

  test('object', () => {
    const value = 'a';
    const tuple = checker.check().object(value).toTuple();
    expect(tuple.object).toBe(value);
  });

  test('withObject', () => {
    const value = 'a';
    const tuple = checker.check().withObject(value).toTuple();
    expect(tuple.object).toBe(value);
  });

  test('relation', () => {
    const value = 'a';
    const tuple = checker.check().hasRelation(value).toTuple();
    expect(tuple.relation).toBe(value);
  });
});
