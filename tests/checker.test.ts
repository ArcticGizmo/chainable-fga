import '../src/env';

import { OpenFgaApi, CredentialsMethod } from '@openfga/sdk';
import { Checker } from '../src/checker';
import { InvalidObjectFormatError, ObjectTypeNotFoundError, RelationNotFoundError } from '../src/errors';

const openFga = new OpenFgaApi({
  apiScheme: 'https',
  apiHost: 'api.us1.fga.dev',
  storeId: process.env['FGA_STORE_ID'] || '',
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      clientId: process.env['FGA_CLIENT_ID'] || '',
      clientSecret: process.env['FGA_CLIENT_SECRET'] || '',
      apiTokenIssuer: 'fga.us.auth0.com',
      apiAudience: 'https://api.us1.fga.dev/'
    }
  }
});

const checker = new Checker(openFga);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAsync = (prom: Promise<any>) => {
  return expect(async () => await prom).rejects;
};

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
  const prom = checker.check().object('invalid').hasRelation('owner').withUser('anne').query();
  await expectAsync(prom).toThrow(InvalidObjectFormatError);
});
