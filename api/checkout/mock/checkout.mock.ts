import type { ApiError } from '@api/_shared/error.types';
import { authStore } from '@shared/store/auth.store';
import { decodeJwtPayload } from '../../auth/jwt';
import { cartStore } from '@shared/store/cart.store';
import { MOCK_ORDERS } from '../../orders/mock/orders.mock.data';
import type { Order, OrderItem } from '../../orders/orders.types';
import type { CheckoutProvider } from '../checkout.provider';
import type {
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  PaymentMethodsList,
  SetupIntentResult,
} from '../checkout.types';
import {
  MOCK_DELAY_MS,
  MOCK_PAYMENT_METHODS,
  MOCK_WEBHOOK_DELAY_MS,
} from './checkout.mock.data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function makeError(
  code: ApiError['code'],
  message: string,
  status: number,
): ApiError {
  return { code, message, status };
}

function currentSubjectId(): string | null {
  const token = authStore.token;
  if (!token) return null;
  return decodeJwtPayload(token)?.sub ?? null;
}

/** Hex-like random id for fake `pi_` / `order_` / `pm_` ids. */
function randomId(prefix: string): string {
  const hex = Math.random().toString(16).slice(2, 14);
  return `${prefix}_${hex}`;
}

async function listPaymentMethods(): Promise<PaymentMethodsList> {
  await delay(MOCK_DELAY_MS);
  const sub = currentSubjectId();
  if (!sub) throw makeError('UNAUTHORIZED', 'not signed in', 401);

  const list = MOCK_PAYMENT_METHODS.get(sub) ?? [];
  return { data: [...list] };
}

async function createSetupIntent(): Promise<SetupIntentResult> {
  await delay(MOCK_DELAY_MS);
  const sub = currentSubjectId();
  if (!sub) throw makeError('UNAUTHORIZED', 'not signed in', 401);

  // The mock doesn't talk to Stripe — return a fake client
  // secret. In live, Stripe.js would consume this string.
  return { clientSecret: `seti_mock_${randomId('cs')}_secret` };
}

async function confirmPayment(
  input: ConfirmPaymentInput,
): Promise<ConfirmPaymentResult> {
  await delay(MOCK_DELAY_MS);
  const sub = currentSubjectId();
  if (!sub) throw makeError('UNAUTHORIZED', 'not signed in', 401);

  // Cart must be non-empty — mirrors BE behaviour.
  const cart = cartStore.cart;
  if (!cart || cart.items.length === 0) {
    throw makeError('CONFLICT', 'cart is empty', 409);
  }

  // Save the "new" payment method to the customer's saved list,
  // so the next checkout can pick it via list_payment_methods.
  // Skips if the supplied id is one we already have.
  const list = MOCK_PAYMENT_METHODS.get(sub) ?? [];
  if (!list.some((pm) => pm.id === input.paymentMethodId)) {
    list.push({
      id: input.paymentMethodId,
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: new Date('2026-01-01').getFullYear() + 4,
    });
    MOCK_PAYMENT_METHODS.set(sub, list);
  }

  // Snapshot the cart into an immutable Order.
  const orderId = randomId('order');
  const stripePaymentIntentId = randomId('pi');
  const now = new Date().toISOString();

  const items: OrderItem[] = cart.items.map((it) => ({
    productId: it.productId,
    name: it.name,
    slug: it.slug,
    price: it.price,
    quantity: it.quantity,
    lineTotal: it.lineTotal,
  }));

  const order: Order = {
    id: orderId,
    customerId: sub,
    currency: cart.currency,
    items,
    itemsTotal: cart.itemsTotal,
    stripePaymentIntentId,
    status: 'pending_payment',
    createdAt: now,
    updatedAt: now,
  };

  MOCK_ORDERS.set(orderId, order);

  // Simulate the Stripe webhook flipping the order to `paid`
  // after a delay. This is what makes the CompleteStep polling
  // demoable WITHOUT a real Stripe + BE running.
  setTimeout(() => {
    const persisted = MOCK_ORDERS.get(orderId);
    if (persisted && persisted.status === 'pending_payment') {
      MOCK_ORDERS.set(orderId, {
        ...persisted,
        status: 'paid',
        stripeChargeId: randomId('ch'),
        updatedAt: new Date().toISOString(),
      });
    }
  }, MOCK_WEBHOOK_DELAY_MS);

  // Clear the cart — mirrors the BE behaviour (cart is consumed
  // by checkout success). Cart store sync happens FE-side; the
  // mock doesn't touch it directly.
  // Note: the caller is expected to refresh / reset the cart
  // store after a successful confirm. We don't do it here
  // because the mock should not mutate stores outside its own
  // domain.

  return {
    orderId,
    stripePaymentIntentId,
    status: 'pending_payment',
  };
}

const checkoutMockProvider: CheckoutProvider = {
  listPaymentMethods,
  createSetupIntent,
  confirmPayment,
};
export default checkoutMockProvider;
