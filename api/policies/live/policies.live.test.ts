import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axiosClient from '@api/_shared/axios.client';
import type { RbacPolicy } from '../policies.types';
import policiesLiveProvider from './policies.live';

const SAMPLE_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ action: '*', resource: '*', effect: 'allow' }],
    },
  ],
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(axiosClient);
});

afterEach(() => {
  mock.restore();
});

describe('policiesLiveProvider.getPolicies', () => {
  it('GETs /v1/policies and returns the parsed policy', async () => {
    mock.onGet('/v1/policies').reply(200, SAMPLE_POLICY);
    const result = await policiesLiveProvider.getPolicies();
    expect(result).toEqual(SAMPLE_POLICY);
  });

  it('throws CONTRACT_MISMATCH when the response shape is wrong', async () => {
    mock.onGet('/v1/policies').reply(200, { notRoles: [] });
    await expect(policiesLiveProvider.getPolicies()).rejects.toMatchObject({
      code: 'CONTRACT_MISMATCH',
    });
  });

  it('throws SERVER_ERROR on 5xx', async () => {
    mock.onGet('/v1/policies').reply(503, { error: 'maintenance' });
    await expect(policiesLiveProvider.getPolicies()).rejects.toMatchObject({
      code: 'SERVER_ERROR',
    });
  });
});
