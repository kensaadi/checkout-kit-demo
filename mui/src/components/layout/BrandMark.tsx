import { useId } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

/**
 * Inline SVG brand mark used by the demo splash, the top bar, and
 * any auth screen where a logo helps anchor identity.
 *
 * Visual: byte-identical to `/public/favicon.svg` — a shopping bag
 * with the brand check stamped through it on the brand gradient.
 * Keeping the in-app logo and the favicon visually identical means
 * the OS tab icon, the home-screen PWA badge, and the in-app top
 * bar all read as one mark.
 *
 * Kept inline (not an `<img src=...>`) so it scales pixel-perfect
 * at any `size` without a network round-trip. `useId` namespaces
 * the gradient so multiple instances on the same page don't clash.
 */
export function BrandMark({
  size = 36,
  withWordmark = false,
  sx,
  wordmarkSx,
}: {
  size?: number;
  withWordmark?: boolean;
  sx?: SxProps<Theme>;
  /** Override sx on the wordmark text. Use to hide responsively
   *  (e.g. `{ display: { xs: 'none', sm: 'inline-block' } }`). */
  wordmarkSx?: SxProps<Theme>;
}) {
  const gradId = `brand-gradient-${useId()}`;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        color: 'primary.main',
        ...sx,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 512 512"
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
        }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="96" fill={`url(#${gradId})`} />
        <path
          d="M 156 232 L 356 232 L 376 404 Q 376 420 360 420 L 152 420 Q 136 420 136 404 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 210 232 Q 210 168 256 168 Q 302 168 302 232"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={26}
          strokeLinecap="round"
        />
        <path
          d="M 196 322 L 240 366 L 322 280"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={38}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>
      {withWordmark && (
        <Box
          component="span"
          sx={{
            fontWeight: 800,
            fontSize: size * 0.5,
            letterSpacing: '-0.02em',
            color: 'text.primary',
            lineHeight: 1,
            ...wordmarkSx,
          }}
        >
          checkout
          <Box component="span" sx={{ color: 'primary.main' }}>
            kit
          </Box>
        </Box>
      )}
    </Box>
  );
}
