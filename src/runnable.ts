import './env';

import { OpenFgaApi, CredentialsMethod } from '@openfga/sdk';
import { Checker } from './checker';

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

export async function example() {
  console.dir('---- example');
  const results = await Promise.all([
    // checker.check().user('anne').hasRelation('__missing__').withObject('itinerary:0001').query()
    // checker.check().user('anne').hasRelation('owner').withObject('__missing__').query()
    checker.check().user('anne').hasRelation('owner').withObject('a:b').query()
    // checker.check().user('anne').hasRelation('owner').withObject('itinerary:0001').query(),
    // checker.check().user('anne').hasRelation('shared_with').withObject('itinerary:0001').query(),
    // checker.check().user('beth').hasRelation('shared_with').withObject('itinerary:0001').query()
  ]);

  console.log(results);
}

example();
