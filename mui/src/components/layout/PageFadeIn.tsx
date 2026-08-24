import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

/**
 * Soft fade-in for any page-level subtree. The animation runs
 * once on mount and never re-plays so navigations feel
 * intentional without becoming busy.
 *
 * IMPORTANT: opacity-only (no transform). A `transform` value —
 * even `translateY(0)` — creates a containing block for fixed
 * descendants, which would re-anchor the InspectThisPage FAB
 * (and any other `position: fixed` children) to this wrapper
 * instead of the viewport. Stick to opacity-only at the page
 * level; if you need a slide / lift effect, scope it to a
 * non-page wrapper that has no fixed descendants.
 *
 * Honors `prefers-reduced-motion`: opted-out users see the
 * subtree immediately.
 */
export function PageFadeIn({
  children,
  sx,
  delay = 0,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
  /** Delay in ms before the fade starts. */
  delay?: number;
}) {
  return (
    <Box
      sx={{
        animation: 'pageFadeIn .45s ease both',
        animationDelay: `${delay}ms`,
        '@keyframes pageFadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
