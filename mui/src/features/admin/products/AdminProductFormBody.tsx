import { Alert, Box, Stack, Typography } from '@mui/material';
import { Button, Switch, TextField, useSnackbar } from '@dashforge/ui';
import { useDashFieldMeta, useDashFormContext } from '@dashforge/forms';
import { useNavigate } from 'react-router-dom';
import {
  admin_create_product,
  admin_update_product,
} from '@api/products/products.service';
import type {
  CreateProductInput,
  Product,
} from '@api/products/products.types';
import { useApiSubmit } from '@shared/forms/useApiSubmit';
import { InputField } from '../../../components/fields';
import { formatPrice } from '../../cart/format';

interface AdminProductFormBodyProps {
  mode: 'create' | 'edit';
  /** Required for edit mode — the id to PATCH against. */
  editId?: string;
  /** Optional — used to render a "live preview" of the formatted price. */
  initialPriceHint?: number;
}

/**
 * Form body shared by Create and Edit pages. Differences kept
 * minimal: the submit function and the success navigation,
 * everything else is identical so the buyer reading the file
 * sees ONE form definition.
 *
 * Field-level RBAC via the `access` prop:
 *   - `price` requires `products:update`. Sales has `products:read`
 *     but not update → field renders READ-ONLY for sales while
 *     staying editable for admin.
 *   - `slug`, `name`, `description`, `currency`, `active` all
 *     gated identically.
 *
 * Sales users effectively get a "view existing product" page
 * without page-level redirects — RBAC degrades the form
 * gracefully field by field. The Save button is gated separately
 * via `<Can action="update" resource="products">`.
 */
export function AdminProductFormBody({
  mode,
  editId,
  initialPriceHint,
}: AdminProductFormBodyProps) {
  const { rhf } = useDashFormContext<CreateProductInput>();
  const navigate = useNavigate();
  const { success } = useSnackbar();

  const onSubmit = useApiSubmit(rhf, {
    submit: async (input) => {
      if (mode === 'create') {
        return admin_create_product(input);
      }
      if (!editId) {
        throw new Error('[AdminProductForm] edit mode without editId');
      }
      return admin_update_product(editId, input);
    },
    onSuccess: (product: Product) => {
      success(mode === 'create' ? 'Product created' : 'Product updated');
      if (mode === 'create') {
        // After create → land on edit page so the user can upload images
        navigate(`/admin/products/${product.id}`, { replace: true });
      } else {
        rhf.reset({
          slug: product.slug,
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          currency: product.currency,
          active: product.active,
        });
      }
    },
  });

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={3}>
        <InputField<CreateProductInput>
          name="name"
          label="Name"
          placeholder="Product name shown to customers"
          access={{
            resource: 'products',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />

        <InputField<CreateProductInput>
          name="slug"
          label="Slug"
          placeholder="gold-plan (lowercase, dashes only)"
          helperText="Lowercase letters, digits and dashes. Must be unique across the catalog."
          access={{
            resource: 'products',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />

        <TextField
          name="description"
          label="Description"
          placeholder="A description shown on the product page."
          multiline
          rows={4}
          fullWidth
          layout="stacked"
          access={{
            resource: 'products',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />

        <Box>
          <InputField<CreateProductInput>
            name="price"
            label="Price (cents)"
            type="number"
            placeholder="4900"
            helperText="Stored in MINOR units. 4900 = $49.00."
            access={{
              resource: 'products',
              action: 'update',
              onUnauthorized: 'readonly',
            }}
          />
          {/* Live preview is its OWN component: it subscribes only to
              `price` + `currency` via useDashFieldMeta (DashForge's
              scoped reactive read), so typing a price re-renders just
              this caption — not the whole form, the way rhf.watch did. */}
          <PricePreview fallbackPrice={initialPriceHint} />
        </Box>

        <InputField<CreateProductInput>
          name="currency"
          label="Currency"
          placeholder="usd"
          helperText="ISO 4217 lowercase code (usd, eur, gbp, …)."
          access={{
            resource: 'products',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
        />

        {/* DashForge Switch binds to the `active` field through the
            form bridge by name — no rhf.watch / rhf.setValue plumbing,
            and it picks up the same RBAC `access` story as every other
            field (read-only for sales, editable for admin). */}
        <Switch
          name="active"
          access={{
            resource: 'products',
            action: 'update',
            onUnauthorized: 'readonly',
          }}
          label={
            <Stack spacing={0.25}>
              <Typography variant="body1">Active</Typography>
              <Typography variant="caption" color="text.secondary">
                Only active products show up on the public storefront.
              </Typography>
            </Stack>
          }
        />

        {mode === 'edit' && (
          <Alert severity="info" variant="outlined">
            After saving the basics, scroll down to manage the cover
            image and gallery.
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="text"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={rhf.formState.isSubmitting}
            disabled={mode === 'edit' && !rhf.formState.isDirty}
            access={{
              resource: 'products',
              action: mode === 'create' ? 'create' : 'update',
              onUnauthorized: 'hide',
            }}
          >
            {mode === 'create' ? 'Create product' : 'Save changes'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

/**
 * Formatted "Customers see: $49.00" caption under the price input.
 *
 * Subscribes to ONLY `price` + `currency` via `useDashFieldMeta` —
 * DashForge's per-field reactive read (useSyncExternalStore under the
 * hood). It re-renders solely when those two fields change, so the
 * rest of the form is untouched while the admin types. This is the
 * idiomatic replacement for `rhf.watch`, which would have re-rendered
 * the whole form body on every keystroke.
 */
function PricePreview({ fallbackPrice }: { fallbackPrice?: number }) {
  const { value: priceValue } = useDashFieldMeta('price');
  const { value: currencyValue } = useDashFieldMeta('currency');

  const price =
    typeof priceValue === 'number' && !Number.isNaN(priceValue)
      ? priceValue
      : fallbackPrice;
  const currency =
    typeof currencyValue === 'string' && currencyValue.length > 0
      ? currencyValue
      : 'usd';

  if (typeof price !== 'number' || price <= 0) return null;

  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', mt: 0.5, ml: 0.5 }}
    >
      Customers see: {formatPrice(price, currency)}
    </Typography>
  );
}
