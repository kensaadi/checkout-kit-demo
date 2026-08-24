import { Box, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import { BrandMark } from './BrandMark';

/**
 * Full-screen loading state shown while the app is bootstrapping
 * (currently: fetching the RBAC policy). Brand mark + wordmark
 * + soft circular progress — keeps identity visible on slow
 * networks so the user knows what they're loading.
 *
 * If the bootstrap fails, `PolicyBootstrap` swaps this out for an
 * error screen with a Retry button.
 */
export function SplashScreen() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Stack spacing={4} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            animation: 'splashPulse 1.6s ease-in-out infinite',
            '@keyframes splashPulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.85, transform: 'scale(1.04)' },
            },
          }}
        >
          <BrandMark size={56} withWordmark />
        </Box>
        <CircularProgress
          size={28}
          thickness={4}
          sx={{ color: theme.tokens.colors.primary }}
        />
        <Typography variant="caption" color="text.disabled">
          Setting things up…
        </Typography>
      </Stack>
    </Box>
  );
}
