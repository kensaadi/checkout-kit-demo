/**
 * Brand tokens consumed by `theme.ts`. Centralised here so a buyer
 * can rebrand the kit by editing one file — colors, typography,
 * radius, shadow, spacing all live here.
 *
 * Two token sets are exported: `lightTokens` and `darkTokens`. The
 * theme factory picks one based on the mode store; both share
 * structure so a component reading `theme.tokens.colors.X` works
 * in either mode without conditionals.
 *
 * Aligned with `@dashforge/tokens` defaultLightTheme so the kit
 * looks at home next to other DashForge products, but kept
 * inlined for now — the full `@dashforge/tokens` integration
 * lands in a later turn and would couple this kit's visual
 * surface to the lib's release cadence.
 *
 * To rebrand, edit ONLY this file — `theme.ts` reads from it.
 */

const shared = {
  /** Typography. Inter for everything; fallback chain for safety. */
  fontFamily:
    '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

  /** Border radius scale. */
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    pill: 999,
  },
} as const;

export const lightTokens = {
  ...shared,
  mode: 'light' as const,

  colors: {
    /** Primary brand. CTAs, links, focus rings. */
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primarySoft: '#DBEAFE',

    /** Secondary brand. Supporting accents. */
    secondary: '#4F46E5',
    secondarySoft: '#E0E7FF',

    /** Money accent — used for prices, totals, "Buy" CTAs. Emerald
     *  to evoke "money positive" without screaming. */
    money: '#059669',
    moneySoft: '#D1FAE5',

    /** Warm accent. Sparing use for "Save"/"Featured" badges. */
    accent: '#F59E0B',
    accentSoft: '#FEF3C7',

    /** Intent palette. */
    success: '#15803D',
    successSoft: '#DCFCE7',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    info: '#0EA5E9',
    infoSoft: '#E0F2FE',

    /** Surfaces. */
    backgroundDefault: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F3F4F6',

    /** Text. */
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    textDisabled: '#9CA3AF',
    textInverse: '#FFFFFF',

    /** Borders + dividers. */
    borderSubtle: '#F3F4F6',
    borderDefault: '#E5E7EB',
    borderStrong: '#D1D5DB',

    /** Body background pattern dot color. */
    bodyDot: 'rgba(15,23,42,0.06)',
  },

  /** Box-shadow scale. Tuned for light surfaces. */
  shadow: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.06)',
    md: '0 4px 12px rgba(15, 23, 42, 0.08)',
    lg: '0 16px 32px rgba(15, 23, 42, 0.12)',
    glow: '0 0 0 4px rgba(37, 99, 235, 0.12)',
  },

  /** Hero gradients. Used by the demo splash + storefront banner. */
  gradients: {
    hero: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
    heroSoft: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)',
  },
};

export type KitTokens = Omit<typeof lightTokens, 'mode'> & {
  mode: 'light' | 'dark';
};

export const darkTokens: KitTokens = {
  ...shared,
  mode: 'dark' as const,

  colors: {
    primary: '#60A5FA',
    primaryHover: '#3B82F6',
    primarySoft: '#1E3A8A',

    secondary: '#818CF8',
    secondarySoft: '#312E81',

    money: '#10B981',
    moneySoft: '#064E3B',

    accent: '#FBBF24',
    accentSoft: '#451A03',

    success: '#22C55E',
    successSoft: '#14532D',
    warning: '#F59E0B',
    warningSoft: '#451A03',
    danger: '#EF4444',
    dangerSoft: '#450A0A',
    info: '#38BDF8',
    infoSoft: '#0C4A6E',

    backgroundDefault: '#0B1220',
    surface: '#111827',
    surfaceElevated: '#1F2937',
    surfaceMuted: '#1F2937',

    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textDisabled: '#6B7280',
    textInverse: '#111827',

    borderSubtle: '#1F2937',
    borderDefault: '#374151',
    borderStrong: '#4B5563',

    bodyDot: 'rgba(255,255,255,0.03)',
  },

  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 4px 12px rgba(0, 0, 0, 0.45)',
    lg: '0 16px 32px rgba(0, 0, 0, 0.55)',
    glow: '0 0 0 4px rgba(96, 165, 250, 0.18)',
  },

  gradients: {
    hero: 'linear-gradient(135deg, #1E3A8A 0%, #312E81 50%, #4C1D95 100%)',
    heroSoft: 'linear-gradient(135deg, #1E3A8A 0%, #312E81 100%)',
  },
};

/**
 * Back-compat default export. Older imports that read
 * `tokens.colors.X` keep working — they get the light tokens.
 * New code should prefer `useTheme().tokens` which respects the
 * current mode.
 */
export const tokens = lightTokens;
