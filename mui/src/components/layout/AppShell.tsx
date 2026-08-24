import { type ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { DemoBanner } from './DemoBanner';
import { PromoBar } from './PromoBar';
import { RouteTransition } from './RouteTransition';
import { TopBar } from './TopBar';

/**
 * Layout wrapper for every authenticated page. Provides the
 * persistent DemoBanner (kit-context disclosure), the topbar, and
 * a constrained content area whose children fade in on every
 * route change — including back / forward navigations — so each
 * navigation reads as intentional.
 *
 * Login pages and the demo splash do NOT use this shell — they
 * render full-screen on their own.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <PromoBar />
      <DemoBanner />
      <TopBar />
      <Box component="main" sx={{ flex: 1, py: 3 }}>
        <Container maxWidth="lg">
          <RouteTransition>{children}</RouteTransition>
        </Container>
      </Box>
    </Box>
  );
}
