/**
 * Locale-aware formatting helpers for order views. Kept separate
 * from `cart/format.ts` so the orders feature stays self-contained
 * even though the price formatter delegates to it.
 */
export { formatPrice } from '../cart/format';

/**
 * Formats an ISO 8601 timestamp into a human-readable date+time
 * string in the user's locale.
 *
 *   "2026-01-15T14:30:00Z" → "Jan 15, 2026, 2:30 PM" (en-US)
 *   "2026-01-15T14:30:00Z" → "15 gen 2026, 14:30"    (it-IT)
 *
 * Returns "—" for missing / unparseable input so callers don't
 * have to guard.
 */
export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

/** Short id helper — "order_abc123def456" → "order_abc1…f456" */
export function shortenId(id: string, head = 8, tail = 4): string {
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}
