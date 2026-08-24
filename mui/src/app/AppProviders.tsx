import { useEffect, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, type Theme } from '@mui/material';
import { SnackbarProvider, useSnackbar } from '@dashforge/ui';
import { DashforgeThemeProvider } from '@dashforge/theme-mui';
import { defaultDarkTheme, defaultLightTheme } from '@dashforge/tokens';
import { setDefaultErrorHandler } from '@shared/forms/useApiSubmit';
import { useThemeMode } from '@shared/store/themeMode.store';
import { darkTheme, lightTheme } from '../theme/theme';
import { PolicyBootstrap } from './PolicyBootstrap';

/**
 * Top-level providers. Order matters:
 *
 *   DashforgeThemeProvider ← the kit's whole point: theming flows
 *                       through DashForge, not vanilla MUI. It builds
 *                       a real MUI theme from a `DashforgeTheme` and
 *                       exposes it as `theme.dashforge`. `withCssBaseline`
 *                       is OFF here — the inner kit theme owns the
 *                       baseline so the body picks up the kit's brand
 *                       palette, not DashForge's defaults.
 *   ThemeProvider     ← inner adapter layer. Re-applies the kit's brand
 *                       theme (palette + the `theme.tokens` augmentation
 *                       that ~32 components read) WHILE grafting on the
 *                       `theme.dashforge` block from the outer provider.
 *                       Net effect: look is unchanged, every component
 *                       keeps reading `theme.tokens`, and DashForge
 *                       components can still read `theme.dashforge`.
 *   SnackbarProvider  ← DashForge's snackbar singleton (`@dashforge/ui`),
 *                       NOT notistack. SnackbarBridge wires the form
 *                       pipeline's default error handler into it.
 *   BrowserRouter     ← so navigate() works anywhere
 *   PolicyBootstrap   ← fetches RBAC policy, gates the app behind
 *                       a splash until it resolves, then mounts
 *                       RbacProvider with the policy + the current
 *                       userStore subject
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const { isDark } = useThemeMode();
  return (
    <DashforgeThemeProvider
      theme={isDark ? defaultDarkTheme : defaultLightTheme}
      withCssBaseline={false}
    >
      <ThemeProvider
        theme={(outer: Theme) => ({
          // Keep the kit's brand theme verbatim (palette + the
          // `tokens` augmentation), just adopt the DashForge block
          // from the outer provider so `theme.dashforge` is present.
          ...(isDark ? darkTheme : lightTheme),
          dashforge: outer.dashforge,
        })}
      >
        <CssBaseline />
        {/* DashForge's SnackbarProvider owns placement / stacking /
            timing internally — no per-instance anchorOrigin / maxSnack
            / autoHideDuration props (defaults: bottom-right, 5000ms). */}
        <SnackbarProvider>
          <SnackbarBridge />
          <BrowserRouter>
            <PolicyBootstrap>{children}</PolicyBootstrap>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </DashforgeThemeProvider>
  );
}

/**
 * Wires the form pipeline's default error handler to DashForge's
 * snackbar.
 *
 * `useApiSubmit` exposes `setDefaultErrorHandler` as a module-level
 * configuration hook so forms.ts stays free of UI-library imports
 * (no circular dep, no peer dep on the snackbar lib inside @shared).
 * The bridge lives here, inside the snackbar context where
 * `useSnackbar` is available, and registers once on mount.
 *
 * Renders nothing — it's a side-effect-only component.
 */
function SnackbarBridge(): null {
  const { error } = useSnackbar();
  useEffect(() => {
    setDefaultErrorHandler((e) => {
      error(e.message);
    });
  }, [error]);
  return null;
}
