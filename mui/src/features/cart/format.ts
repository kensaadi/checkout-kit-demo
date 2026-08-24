/**
 * Formats a minor-units price (cents) using the browser's Intl
 * locale resolution. Returns e.g. "$49.00" for `4900` + `usd`.
 *
 * Locale defaults to the user's browser locale. The currency
 * argument should match the cart's `currency` field (lowercased
 * ISO 4217 code as the BE emits it — `Intl` accepts either case).
 */
export function formatPrice(minorUnits: number, currency: string): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase() || 'USD',
  });
  return formatter.format(minorUnits / 100);
}
