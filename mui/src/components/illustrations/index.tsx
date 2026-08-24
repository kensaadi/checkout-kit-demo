import { Box, useTheme } from '@mui/material';

/**
 * Hand-drawn line-art SVG illustrations used in empty states.
 * Each one references theme tokens via currentColor (passed
 * inline through `sx.color`), so it adapts to light/dark mode
 * and the active brand palette without per-mode duplicates.
 *
 * The shapes are deliberately a little asymmetric — feels less
 * stock-vector, more "someone drew this".
 *
 * Size via the `size` prop (default 180). For non-square aspect
 * the SVG viewBox is preserved.
 */

type IllustrationProps = { size?: number };

/** Shopping cart with a tag dangling from a handle. */
export function EmptyCartIllustration({ size = 180 }: IllustrationProps) {
  const theme = useTheme();
  const primary = theme.tokens.colors.primary;
  const accent = theme.tokens.colors.accent;
  const muted = theme.tokens.colors.textMuted;

  return (
    <Box
      component="svg"
      viewBox="0 0 200 200"
      sx={{ width: size, height: size }}
      aria-hidden
    >
      {/* soft halo */}
      <circle cx="100" cy="105" r="78" fill={`${primary}14`} />
      {/* cart body */}
      <path
        d="M40 60h22l10 64a8 8 0 0 0 8 7h54a8 8 0 0 0 8-6l12-46H72"
        fill="none"
        stroke={primary}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* wheels */}
      <circle cx="84" cy="156" r="9" fill={primary} />
      <circle cx="136" cy="156" r="9" fill={primary} />
      <circle cx="84" cy="156" r="3" fill={theme.tokens.colors.surface} />
      <circle cx="136" cy="156" r="3" fill={theme.tokens.colors.surface} />
      {/* dotted "empty" inside */}
      <circle cx="92" cy="98" r="3" fill={muted} />
      <circle cx="110" cy="98" r="3" fill={muted} />
      <circle cx="128" cy="98" r="3" fill={muted} />
      {/* tag dangling */}
      <line
        x1="156"
        y1="72"
        x2="170"
        y2="58"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="166"
        y="42"
        width="22"
        height="22"
        rx="4"
        transform="rotate(15 177 53)"
        fill={accent}
      />
      <circle
        cx="178"
        cy="49"
        r="2"
        fill={theme.tokens.colors.surface}
        transform="rotate(15 178 49)"
      />
    </Box>
  );
}

/** A stack of receipts with a sparkline on top. */
export function EmptyOrdersIllustration({ size = 180 }: IllustrationProps) {
  const theme = useTheme();
  const primary = theme.tokens.colors.primary;
  const accent = theme.tokens.colors.money;

  return (
    <Box
      component="svg"
      viewBox="0 0 200 200"
      sx={{ width: size, height: size }}
      aria-hidden
    >
      <circle cx="100" cy="105" r="78" fill={`${primary}14`} />
      {/* back receipt */}
      <rect
        x="60"
        y="64"
        width="80"
        height="100"
        rx="6"
        transform="rotate(-6 100 114)"
        fill={theme.tokens.colors.surface}
        stroke={primary}
        strokeWidth="3.5"
      />
      {/* front receipt */}
      <rect
        x="62"
        y="60"
        width="80"
        height="106"
        rx="6"
        transform="rotate(4 102 113)"
        fill={theme.tokens.colors.surface}
        stroke={primary}
        strokeWidth="3.5"
      />
      {/* receipt lines */}
      <line x1="78" y1="86" x2="118" y2="92" stroke={primary} strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="102" x2="130" y2="108" stroke={primary} strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="118" x2="120" y2="124" stroke={primary} strokeWidth="3" strokeLinecap="round" />
      {/* sparkline on top */}
      <polyline
        points="76,148 92,140 108,148 124,134 140,142"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="140" cy="142" r="4" fill={accent} />
    </Box>
  );
}

/** Empty shelf with a single floating "?" box. */
export function EmptyCatalogIllustration({ size = 180 }: IllustrationProps) {
  const theme = useTheme();
  const primary = theme.tokens.colors.primary;
  const accent = theme.tokens.colors.accent;
  const muted = theme.tokens.colors.borderDefault;

  return (
    <Box
      component="svg"
      viewBox="0 0 200 200"
      sx={{ width: size, height: size }}
      aria-hidden
    >
      <circle cx="100" cy="105" r="78" fill={`${primary}14`} />
      {/* shelf */}
      <line x1="36" y1="142" x2="164" y2="142" stroke={primary} strokeWidth="5" strokeLinecap="round" />
      <line x1="48" y1="142" x2="48" y2="160" stroke={primary} strokeWidth="5" strokeLinecap="round" />
      <line x1="152" y1="142" x2="152" y2="160" stroke={primary} strokeWidth="5" strokeLinecap="round" />
      {/* shelf back outline (empty slots) */}
      <rect x="56" y="92" width="32" height="48" rx="4" fill="none" stroke={muted} strokeWidth="3" strokeDasharray="4 4" />
      <rect x="112" y="92" width="32" height="48" rx="4" fill="none" stroke={muted} strokeWidth="3" strokeDasharray="4 4" />
      {/* floating product with ? */}
      <rect
        x="80"
        y="48"
        width="40"
        height="40"
        rx="8"
        fill={accent}
        transform="rotate(-6 100 68)"
      />
      <text
        x="100"
        y="76"
        textAnchor="middle"
        fontSize="24"
        fontWeight="800"
        fill={theme.tokens.colors.surface}
        fontFamily="Inter, sans-serif"
        transform="rotate(-6 100 68)"
      >
        +
      </text>
    </Box>
  );
}

/** Magnifying glass over an empty surface with stray dots. */
export function NoSearchResultsIllustration({
  size = 180,
}: IllustrationProps) {
  const theme = useTheme();
  const primary = theme.tokens.colors.primary;
  const muted = theme.tokens.colors.textMuted;

  return (
    <Box
      component="svg"
      viewBox="0 0 200 200"
      sx={{ width: size, height: size }}
      aria-hidden
    >
      <circle cx="100" cy="105" r="78" fill={`${primary}14`} />
      {/* stray dots — "noise" */}
      <circle cx="56" cy="76" r="3" fill={muted} />
      <circle cx="148" cy="60" r="3" fill={muted} />
      <circle cx="64" cy="148" r="3" fill={muted} />
      <circle cx="140" cy="148" r="3" fill={muted} />
      <circle cx="160" cy="110" r="3" fill={muted} />
      <circle cx="50" cy="118" r="3" fill={muted} />
      {/* magnifying glass */}
      <circle
        cx="92"
        cy="98"
        r="34"
        fill={theme.tokens.colors.surface}
        stroke={primary}
        strokeWidth="5"
      />
      <line
        x1="118"
        y1="124"
        x2="148"
        y2="154"
        stroke={primary}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* tiny empty mark inside */}
      <line
        x1="80"
        y1="98"
        x2="104"
        y2="98"
        stroke={primary}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </Box>
  );
}
