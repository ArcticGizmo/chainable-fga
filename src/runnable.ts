import './env';

import { OpenFgaApi, CredentialsMethod } from '@openfga/sdk';
import { Checker } from './checker';
import { Finder } from './finder';

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
const finder = new Finder(openFga);

export async function example() {
  console.dir('---- example');
  const results = await Promise.all([
    // checker.check().user('anne').hasRelation('__missing__').withObject('itinerary:0001').query()
    // checker.check().user('anne').hasRelation('owner').withObject('__missing__').query()
    // checker.check().user('anne').hasRelation('owner').withObject('a:b').query()
    // checker.check().user('anne').hasRelation('owner').withObject('itinerary:0001').query(),
    // checker.check().user('anne').hasRelation('shared_with').withObject('itinerary:0001').query(),
    // checker.check().user('beth').hasRelation('shared_with').withObject('itinerary:0001').query()
    // finder.users({ relation: 'owner', object: 'itinerary:0001' }),
    // finder.relations({ user: 'anne', object: 'itinerary:0001' })
    // finder.find({ object: "itinerary:0001" }),
    // finder.find({ user: 'anne', object: 'itinerary:' })
    finder.objects({ user: 'anne', type: 'itinerary', relation: 'owner' })
  ]);

  console.log(...results);
}

example();
