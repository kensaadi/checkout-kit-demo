import { attempt } from '@api/_shared/attempt';
import type { Result } from '@api/_shared/result.types';
import { cartProvider } from './cart.provider';
import type {
  AddItemInput,
  CartView,
  UpdateItemInput,
} from './cart.types';

/**
 * Returns the enriched cart for the current customer.
 *
 * Auto-creates an empty cart on first call (BE behavior), so the
 * FE never has to branch on "cart exists vs not".
 */
export async function get_cart(): Promise<Result<CartView>> {
  const provider = await cartProvider();
  return attempt(provider.getCart());
}

/**
 * Adds an item to the cart with MERGE semantics: if the product is
 * already in the cart, the new quantity is ADDED to the existing
 * one. Use `update_item` to set an absolute quantity.
 *
 * Returns the full cart view, so the caller can update the cart
 * store / topbar counter in one step.
 */
export async function add_item(
  input: AddItemInput,
): Promise<Result<CartView>> {
  const provider = await cartProvider();
  return attempt(provider.addItem(input));
}

/**
 * Sets the ABSOLUTE quantity of an existing line item. Quantity
 * must be ≥ 1. To remove an item, use `remove_item` instead — it's
 * semantically clearer than passing quantity 0.
 */
export async function update_item(
  productId: string,
  input: UpdateItemInput,
): Promise<Result<CartView>> {
  const provider = await cartProvider();
  return attempt(provider.updateItem(productId, input));
}

/**
 * Removes a single item from the cart. Idempotent: removing an item
 * that isn't in the cart returns the cart unchanged with success
 * — the FE doesn't need to pre-check.
 */
export async function remove_item(
  productId: string,
): Promise<Result<CartView>> {
  const provider = await cartProvider();
  return attempt(provider.removeItem(productId));
}

/**
 * Empties the cart entirely. Also resets the currency lock so the
 * next added item can pick any currency.
 *
 * Idempotent: clearing an already-empty cart still succeeds.
 */
export async function clear_cart(): Promise<Result<CartView>> {
  const provider = await cartProvider();
  return attempt(provider.clearCart());
}
