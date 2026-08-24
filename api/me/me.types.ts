import { z } from 'zod';

/**
 * Staff profile returned by `GET /v1/me` for users with admin /
 * sales roles. The BE strips `passwordHash` via `json:"-"`, so it
 * never reaches the wire.
 */
export const StaffProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  roles: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type StaffProfile = z.infer<typeof StaffProfileSchema>;

/**
 * Customer profile returned by `GET /v1/customer/me`.
 *
 * `stripeCustomerId` is lazy-provisioned by the BE on first
 * checkout-related call — may be absent for newly-registered
 * customers who have never reached the checkout step.
 */
export const CustomerProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  stripeCustomerId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;

/**
 * Input for `PATCH /v1/customer/me`. Only fields the customer is
 * allowed to mutate. Email is intentionally excluded — changing
 * email needs a verification flow, out of scope for this kit.
 */
export const UpdateCustomerInputSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(120),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(120),
});
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerInputSchema>;

/**
 * Input for `POST /v1/customer/change-password`. The BE
 * additionally checks current password matches before applying.
 */
export const ChangePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match',
  });
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;

export const ChangePasswordResultSchema = z.object({
  ok: z.literal(true),
});
export type ChangePasswordResult = z.infer<typeof ChangePasswordResultSchema>;
