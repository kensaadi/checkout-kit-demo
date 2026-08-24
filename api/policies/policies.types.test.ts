import { describe, expect, it } from 'vitest';
import {
  PermissionSchema,
  RbacPolicySchema,
  RoleSchema,
} from './policies.types';

describe('PermissionSchema', () => {
  it('accepts a minimal permission', () => {
    expect(
      PermissionSchema.safeParse({ action: 'read', resource: 'self' }).success,
    ).toBe(true);
  });

  it('accepts an "allow" effect', () => {
    expect(
      PermissionSchema.safeParse({
        action: 'read',
        resource: 'self',
        effect: 'allow',
      }).success,
    ).toBe(true);
  });

  it('accepts a "deny" effect', () => {
    expect(
      PermissionSchema.safeParse({
        action: 'read',
        resource: 'self',
        effect: 'deny',
      }).success,
    ).toBe(true);
  });

  it('rejects an unknown effect', () => {
    expect(
      PermissionSchema.safeParse({
        action: 'read',
        resource: 'self',
        effect: 'maybe',
      }).success,
    ).toBe(false);
  });

  it('rejects missing action or resource', () => {
    expect(PermissionSchema.safeParse({ resource: 'self' }).success).toBe(false);
    expect(PermissionSchema.safeParse({ action: 'read' }).success).toBe(false);
  });
});

describe('RoleSchema', () => {
  it('accepts a role with only permissions', () => {
    expect(
      RoleSchema.safeParse({
        name: 'customer',
        permissions: [{ action: 'read', resource: 'cart', effect: 'allow' }],
      }).success,
    ).toBe(true);
  });

  it('accepts a role with inherits', () => {
    expect(
      RoleSchema.safeParse({
        name: 'admin',
        permissions: [],
        inherits: ['sales'],
      }).success,
    ).toBe(true);
  });

  it('rejects a role missing permissions', () => {
    expect(RoleSchema.safeParse({ name: 'customer' }).success).toBe(false);
  });
});

describe('RbacPolicySchema', () => {
  it('accepts the kit\'s seeded shape', () => {
    expect(
      RbacPolicySchema.safeParse({
        roles: [
          {
            name: 'admin',
            permissions: [{ action: '*', resource: '*', effect: 'allow' }],
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('accepts an empty roles array', () => {
    expect(RbacPolicySchema.safeParse({ roles: [] }).success).toBe(true);
  });

  it('rejects a missing roles field', () => {
    expect(RbacPolicySchema.safeParse({}).success).toBe(false);
  });
});
