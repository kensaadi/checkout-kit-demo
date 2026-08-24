import { DashFormProvider } from '@dashforge/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateProductInputSchema,
  type CreateProductInput,
  type Product,
} from '@api/products/products.types';
import { AdminProductFormBody } from './AdminProductFormBody';

/**
 * Parent — mounts the DashFormProvider with the zod resolver.
 *
 * Used in two modes:
 *   create: defaultValues are empty (`active: true` to match the
 *           BE default expected behaviour)
 *   edit:   pre-filled from the fetched product
 */
export function AdminProductForm({
  mode,
  editId,
  initial,
}: {
  mode: 'create' | 'edit';
  editId?: string;
  initial?: Product;
}) {
  const defaults: CreateProductInput = initial
    ? {
        slug: initial.slug,
        name: initial.name,
        description: initial.description ?? '',
        price: initial.price,
        currency: initial.currency,
        active: initial.active,
      }
    : {
        slug: '',
        name: '',
        description: '',
        price: 0,
        currency: 'usd',
        active: true,
      };

  return (
    <DashFormProvider<CreateProductInput>
      resolver={zodResolver(CreateProductInputSchema)}
      defaultValues={defaults}
      mode="onBlur"
    >
      <AdminProductFormBody
        mode={mode}
        editId={editId}
        initialPriceHint={initial?.price}
      />
    </DashFormProvider>
  );
}
