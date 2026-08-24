import { useEffect, useState, type ReactNode } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

/**
 * Re-plays a soft opacity fade-in every time the route changes —
 * including back / forward navigations. Re-mounting on
 * `location.pathname` would re-fetch any in-flight data, so
 * instead we key on a counter that bumps when the path changes
 * and use it to retrigger the CSS animation by remounting only
 * the inner Box.
 *
 * Wraps the whole AppRouter outlet, so every route gets the same
 * transition without per-page wiring.
 *
 * Pure opacity (no transform) — same reason as PageFadeIn: a
 * transform value would create a containing block for fixed
 * descendants (InspectThisPage FAB, snackbars, modals) and
 * mis-anchor them to this wrapper instead of the viewport.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick((t) => t + 1);
  }, [location.pathname]);

  return (
    <Box
      key={tick}
      sx={{
        animation: 'routeFadeIn .35s ease-out both',
        '@keyframes routeFadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      {children}
    </Box>
  );
}
