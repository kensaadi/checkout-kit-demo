import axiosClient from '@api/_shared/axios.client';
import type { CheckoutProvider } from '../checkout.provider';
import {
  PaymentMethodsListSchema,
  SetupIntentResultSchema,
  type ConfirmPaymentInput,
  type ConfirmPaymentResult,
  type PaymentMethodsList,
  type SetupIntentResult,
} from '../checkout.types';
import { mapConfirmPaymentResult } from './checkout.live.mapper';
import {
  BackendConfirmPaymentResponseSchema,
  type BackendConfirmPaymentResponse,
} from './checkout.live.types';

async function listPaymentMethods(): Promise<PaymentMethodsList> {
  // BE shape already matches the FE shape — the extra fields
  // (`holderName`, `isDefault`) are stripped by zod's default policy.
  const { data } = await axiosClient.get<PaymentMethodsList>(
    '/v1/checkout/payment-methods',
    { responseSchema: PaymentMethodsListSchema },
  );
  return data;
}

async function createSetupIntent(): Promise<SetupIntentResult> {
  // BE shape `{ clientSecret }` matches the FE shape exactly.
  const { data } = await axiosClient.post<SetupIntentResult>(
    '/v1/checkout/setup-intent',
    undefined,
    { responseSchema: SetupIntentResultSchema },
  );
  return data;
}

async function confirmPayment(
  input: ConfirmPaymentInput,
): Promise<ConfirmPaymentResult> {
  // BE returns the full Order entity; we map down to the three
  // fields the FE consumes (see checkout.live.mapper.ts).
  const { data } = await axiosClient.post<BackendConfirmPaymentResponse>(
    '/v1/checkout/confirm',
    input,
    { responseSchema: BackendConfirmPaymentResponseSchema },
  );
  return mapConfirmPaymentResult(data);
}

const checkoutLiveProvider: CheckoutProvider = {
  listPaymentMethods,
  createSetupIntent,
  confirmPayment,
};
export default checkoutLiveProvider;
