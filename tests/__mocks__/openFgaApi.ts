/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenFgaApi } from '@openfga/sdk';
import type { CheckRequest, ReadRequest } from '@openfga/sdk';
import type { CallResult } from '@openfga/sdk/dist/common';
import { AxiosResponse } from 'axios';

interface ConcreteTupleKey {
  user: string;
  object: string;
  relation: string;
}

const axiosResp = (): AxiosResponse => {
  return {
    data: 'string',
    status: 400,
    statusText: 'some-text',
    headers: {},
    config: {
      data: 'string'
    }
  };
};

const errorResp = (code: string) => {
  return {
    responseData: {
      code
    }
  };
};

export class MockFgaApi {
  async check(body: CheckRequest): Promise<CallResult<any>> {
    const { relation, object } = body.tuple_key as ConcreteTupleKey;

    if (object === '__invalid__') {
      throw errorResp('invalid_object_format');
    }

    if (object.startsWith('__invalid__:')) {
      throw errorResp('type_not_found');
    }

    if (relation === '__invalid__') {
      throw errorResp('relation_not_found');
    }

    return { $response: axiosResp(), resolution: '', allowed: true };
  }

  async read(body: ReadRequest): Promise<CallResult<any>> {
    console.dir('---- read');

    return {
      $response: axiosResp(),
      tuples: [],
      continuation_token: ''
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MockOpenFgaApi = () => new MockFgaApi() as any as OpenFgaApi;
