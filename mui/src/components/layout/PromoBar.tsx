import { Box, Stack, Typography, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

const KIT_URL = 'https://dashforge-ui.com/starter-kits';

/**
 * Marketing strip pinned above the demo banner on every screen.
 * Tells the visitor that the code they're playing with is the kit
 * they can buy. The CTA is intentionally a no-op for now — once
 * the pricing page lands, swap the `href` (or wire navigate).
 *
 * Style: dark "Stripe-style" tape that stays visible without
 * fighting the brand gradient banner immediately below it. Looks
 * intentional in both light and dark mode because the bar itself
 * is always dark.
 *
 * Removed by the buyer in their fork: delete this file + drop the
 * three mount lines in AppShell, DemoSplashPage, and LoginPage.
 */
export function PromoBar() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: '#0B1220',
        color: '#FFFFFF',
        px: { xs: 2, md: 4 },
        py: { xs: 1, md: 1.25 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* soft glow accents — make the dark stripe feel intentional */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 12% 50%, rgba(96,165,250,0.18) 0%, transparent 40%), radial-gradient(circle at 88% 50%, rgba(124,58,237,0.18) 0%, transparent 40%)',
          pointerEvents: 'none',
        }}
      />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 0.75, sm: 2 }}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', textAlign: 'center' }}
        >
          <AutoAwesomeOutlinedIcon
            sx={{
              fontSize: 16,
              color: theme.tokens.colors.accent,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              letterSpacing: '0.01em',
              fontSize: { xs: '0.78rem', md: '0.85rem' },
              lineHeight: 1.3,
            }}
          >
            <Box
              component="span"
              sx={{
                fontWeight: 700,
              }}
            >
              Production Stripe checkout app
            </Box>
            {' — from '}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: theme.tokens.colors.accent,
              }}
            >
              $299
            </Box>
            <Box
              component="span"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                display: { xs: 'none', sm: 'inline' },
              }}
            >
              {' '}· Go + Node, MUI + Tailwind all included
            </Box>
          </Typography>
        </Stack>

        <Box
          component="button"
          type="button"
          aria-label="See pricing"
          onClick={() => window.open(KIT_URL, '_blank', 'noopener,noreferrer')}
          sx={{
            appearance: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: '#FFFFFF',
            color: '#0B1220',
            px: 1.75,
            py: 0.6,
            borderRadius: theme.tokens.radius.pill + 'px',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.01em',
            transition: 'transform .15s ease, box-shadow .2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
            },
            '&:active': { transform: 'translateY(0)' },
            '&:focus-visible': {
              outline: `2px solid ${theme.tokens.colors.accent}`,
              outlineOffset: 2,
            },
          }}
        >
          See pricing
          <ArrowForwardIcon sx={{ fontSize: 14 }} />
        </Box>
      </Stack>
    </Box>
  );
}
