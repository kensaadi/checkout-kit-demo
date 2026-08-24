import { useState } from 'react';
import { Box, IconButton, Stack, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';

const DISMISS_KEY = 'checkout-kit:demoBanner:dismissed';

/**
 * Persistent banner shown above the app shell. Tells visitors
 * that this is a demo — no real charges, no real catalog — so a
 * confused customer doesn't try to actually buy something thinking
 * it's a real shop.
 *
 * Dismissable with × button; the choice persists in localStorage
 * so subsequent navigations stay clean. The kit's buyer can
 * delete this file in their fork — it's a pure demo-context
 * component and is not referenced by any business logic.
 */
export function DemoBanner() {
  const theme = useTheme();
  const initiallyDismissed =
    typeof window !== 'undefined' &&
    window.localStorage.getItem(DISMISS_KEY) === '1';
  const [dismissed, setDismissed] = useState(initiallyDismissed);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // localStorage can throw in private mode — non-fatal here.
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        background: theme.tokens.gradients.hero,
        color: 'white',
        px: { xs: 2, md: 4 },
        py: 1.25,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            letterSpacing: '0.01em',
            textAlign: 'center',
          }}
        >
          <strong>UI demo · mock mode</strong> — real interface,
          mock data, no backend and no real charges. The production
          app (Node/Go backend, Stripe webhooks, orders, RBAC,
          admin) is the{' '}
          <Box
            component="a"
            href="https://dashforge-ui.com/starter-kits"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}
          >
            Checkout Kit
          </Box>
          .
        </Typography>
      </Stack>
      <IconButton
        size="small"
        onClick={handleDismiss}
        aria-label="Dismiss demo banner"
        sx={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'inherit',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
