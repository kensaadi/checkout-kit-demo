import { z } from 'zod';

/**
 * Schemas mirroring `@dashforge/rbac` core types byte-for-byte.
 *
 * The BE serves the policy JSON at `GET /v1/policies` in this
 * exact shape (see `server/seed/policies.json` and the Go
 * `pkg/rbac` package). The FE feeds the same JSON to
 * `<RbacProvider policy={...}>` without translation — that wire
 * compatibility is one of DashForge's value-props.
 *
 * The `condition` field of `Permission` is intentionally NOT in
 * the schema: it's a runtime JS function in the engine, never
 * present on the JSON wire. If the BE sends one (it won't), it's
 * silently dropped by zod's `.strict()` complementary stripping.
 */
export const PermissionEffectSchema = z.union([
  z.literal('allow'),
  z.literal('deny'),
]);

export const PermissionSchema = z.object({
  action: z.string(),
  resource: z.string(),
  effect: PermissionEffectSchema.optional(),
});

export const RoleSchema = z.object({
  name: z.string(),
  permissions: z.array(PermissionSchema),
  inherits: z.array(z.string()).optional(),
});

export const RbacPolicySchema = z.object({
  roles: z.array(RoleSchema),
});
export type RbacPolicy = z.infer<typeof RbacPolicySchema>;
