import { useEffect, useRef, useState } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

/**
 * Animated number counter. Counts from 0 → `value` over `duration`
 * ms using requestAnimationFrame + an ease-out curve so the
 * deceleration feels intentional.
 *
 * Re-counts when `value` changes — if the underlying KPI shifts
 * from 12 → 15, the counter fades down to 0 then re-runs to 15.
 * Skipped silently for `prefers-reduced-motion`, which renders
 * the final value immediately.
 *
 * Pass non-numeric values (e.g. 'Manage', 'Live') as-is — they
 * render verbatim, no counter.
 */
export function CountUp({
  value,
  duration = 900,
  sx,
}: {
  value: number | string | null;
  duration?: number;
  sx?: SxProps<Theme>;
}) {
  const [display, setDisplay] = useState<number | string | null>(value);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Non-numeric values just render verbatim.
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      setDisplay(value);
      return;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplay(value);
      return;
    }

    const target = value;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    }
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== undefined) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);

  return (
    <Box
      component="span"
      sx={{ fontVariantNumeric: 'tabular-nums', ...sx }}
    >
      {display ?? '—'}
    </Box>
  );
}
