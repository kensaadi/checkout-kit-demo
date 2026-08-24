import { Box, Stack, Typography } from '@mui/material';
import { Button } from '@dashforge/ui';
import { useNavigate } from 'react-router-dom';
import { EmptyCartIllustration } from '../../components/illustrations';

/**
 * Empty cart placeholder. Custom line-art SVG illustration that
 * adapts to the active mode (light/dark) via theme tokens.
 *
 * Includes a "Browse the shop" CTA so the user has a non-dead-end
 * from this state.
 */
export function EmptyCart() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 10 },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 420,
        }}
      >
        <EmptyCartIllustration size={200} />

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Nothing in here yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Toss a product in and the checkout is two screens away.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="text" onClick={() => navigate('/welcome')}>
            Back to home
          </Button>
          <Button variant="contained" onClick={() => navigate('/shop')}>
            Browse the shop
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
