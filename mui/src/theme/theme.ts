import { createTheme, type Theme } from '@mui/material/styles';
import {
  darkTokens,
  lightTokens,
  tokens as lightTokensExport,
  type KitTokens,
} from './tokens';

export type ThemeMode = 'light' | 'dark';

/**
 * The MUI theme used by the kit. Everything brand-related is read
 * from `./tokens.ts` — to rebrand, edit tokens, not this file.
 *
 * Two themes are produced: light + dark. The mode store picks
 * one; AppProviders feeds it to ThemeProvider. Components read
 * raw tokens via `useTheme().tokens.colors.X` (module
 * augmentation below) and they automatically resolve to the
 * active mode.
 */
declare module '@mui/material/styles' {
  interface Theme {
    tokens: KitTokens;
  }
  interface ThemeOptions {
    tokens?: KitTokens;
  }
}

function makeTheme(t: KitTokens): Theme {
  return createTheme({
    tokens: t,
    palette: {
      mode: t.mode,
      primary: {
        main: t.colors.primary,
        dark: t.colors.primaryHover,
        light: t.colors.primarySoft,
        contrastText: t.colors.textInverse,
      },
      secondary: {
        main: t.colors.secondary,
        light: t.colors.secondarySoft,
        contrastText: t.colors.textInverse,
      },
      success: {
        main: t.colors.success,
        light: t.colors.successSoft,
      },
      warning: {
        main: t.colors.warning,
        light: t.colors.warningSoft,
      },
      error: {
        main: t.colors.danger,
        light: t.colors.dangerSoft,
      },
      info: {
        main: t.colors.info,
        light: t.colors.infoSoft,
      },
      background: {
        default: t.colors.backgroundDefault,
        paper: t.colors.surface,
      },
      text: {
        primary: t.colors.textPrimary,
        secondary: t.colors.textSecondary,
        disabled: t.colors.textDisabled,
      },
      divider: t.colors.borderDefault,
    },

    typography: {
      fontFamily: t.fontFamily,
      h1: { fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 },
      h2: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
      h3: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25 },
      h4: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 },
      h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
      h6: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
      overline: { fontWeight: 600, letterSpacing: '0.08em' },
    },

    shape: {
      borderRadius: t.radius.md,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Subtle dot pattern across large empty surfaces. Tuned
            // per mode: a 6% opacity is still subtle in light, while
            // 3% is enough on dark to read as texture without
            // becoming noise. Spacing 28px gives more air than the
            // default 24px so the pattern feels intentional, not
            // graph-paper.
            backgroundImage: `radial-gradient(circle at 1px 1px, ${t.colors.bodyDot} 1px, transparent 0)`,
            backgroundSize: '28px 28px',
            transition: 'background-color .3s ease, color .3s ease',
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: t.radius.lg,
            border: `1px solid ${t.colors.borderSubtle}`,
            boxShadow: t.shadow.sm,
            transition:
              'box-shadow .25s ease, transform .25s ease, border-color .25s ease, background-color .3s ease',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: t.radius.md,
            paddingInline: 18,
            paddingBlock: 9,
            transition:
              'transform .15s ease, box-shadow .2s ease, background-color .2s ease',
            '&:hover': { transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0)' },
            '&.MuiButton-contained.MuiButton-colorPrimary': {
              boxShadow: t.shadow.sm,
              '&:hover': { boxShadow: t.shadow.md },
            },
          },
          sizeLarge: { paddingInline: 24, paddingBlock: 12, fontSize: '1rem' },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: t.colors.surface,
            borderBottom: `1px solid ${t.colors.borderSubtle}`,
            backdropFilter: 'saturate(180%) blur(8px)',
            transition: 'background-color .3s ease, border-color .3s ease',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: t.radius.pill,
            fontWeight: 600,
            letterSpacing: 0.2,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: t.radius.md },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: t.radius.md,
            backgroundColor: t.colors.surface,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: t.colors.textPrimary,
            color: t.colors.textInverse,
            borderRadius: t.radius.sm,
            padding: '6px 10px',
            fontSize: '0.75rem',
          },
        },
      },
    },
  });
}

export const lightTheme = makeTheme(lightTokens);
export const darkTheme = makeTheme(darkTokens);

/**
 * Back-compat default export. Older imports of `muiTheme` keep
 * working — they get the light theme. New code uses
 * `useThemeMode()` + `lightTheme` / `darkTheme` selection in
 * AppProviders.
 */
export const muiTheme = lightTheme;

// Re-export so consumers can import token shapes from one place.
export { lightTokensExport };
