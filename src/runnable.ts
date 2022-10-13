import './env';

import { OpenFgaApi, CredentialsMethod } from '@openfga/sdk';
import { Checker } from './checker';
import { Finder } from './finder';
import { Rbac } from './rbac';
import { Writer } from './writer';

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

const writer = new Writer(openFga);
const checker = new Checker(openFga);
const finder = new Finder(openFga);
const rbac = new Rbac(openFga);

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
    // finder.objects({ user: 'anne', type: 'itinerary', relation: 'owner' })
    // finder.findObjects().ofType('page').forUser('beth').withRelation('can_view').query(),
    // finder.findObjects().ofType('role').forUser('anne').withRelation('assigned').query(),
    // finder.findObjects().ofType('role').forUser('beth').withRelation('assigned').query(),
    // finder.findObjects().ofType('role').forUser('zack').withRelation('assigned').query(),
    // rbac.check().user('anne').hasRole('worker').query(),
    // rbac.check().user('anne').hasRole('admin').query(),
    // rbac.check().user('zack').hasRole('admin').query(),
    // rbac.check().user('zack').hasRole('worker').query()
    rbac.findRoles().forUser('zack').query()
  ]);

  console.log(...results);
}

async function runWriter() {
  console.dir('---- running writer');
  const a = await writer
    .transaction()
    .add(e => e.user('dave').withRelation('owner').toObject('itinerary:0003'))
    .commit();

  console.dir(a);

  const b = await writer
    .transaction()
    .delete(e => e.user('dave').withRelation('owner').toObject('itinerary:0003'))
    .commit();

  console.dir(b);
}

runWriter();
