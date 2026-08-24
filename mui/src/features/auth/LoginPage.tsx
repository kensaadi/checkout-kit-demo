import {
  Box,
  Card,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { BrandMark } from '../../components/layout/BrandMark';
import { DemoBanner } from '../../components/layout/DemoBanner';
import { PromoBar } from '../../components/layout/PromoBar';
import { ThemeModeToggle } from '../../components/layout/ThemeModeToggle';
import { LoginForm } from './LoginForm';

/**
 * Manual sign-in page used for both `/login` (staff) and
 * `/customer-login` (customer). The `kind` prop decides which
 * auth service function the submitted form will call.
 *
 * Layout:
 *   - DemoBanner + top bar (brand mark + mode toggle)
 *   - Left column: hero copy + LoginForm in a Card
 *   - Right column (md+): "← prefer the fast lane?" callout that
 *     bounces the user back to the demo splash one-click flow
 *
 * The kit's buyer who removes the demo splash also removes this
 * callout — single-file edit.
 */
export function LoginPage({ kind }: { kind: 'staff' | 'customer' }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isStaff = kind === 'staff';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <PromoBar />
      <DemoBanner />

      <Box
        sx={{
          px: { xs: 3, md: 6 },
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <BrandMark size={36} withWordmark />
        <ThemeModeToggle />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 4, md: 5 },
            gridTemplateColumns: { xs: '1fr', md: '420px 320px' },
            alignItems: 'start',
            width: '100%',
            maxWidth: 820,
          }}
        >
          {/* --- Left: form --- */}
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {isStaff ? 'Back-office access' : 'Welcome back'}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  mb: 1,
                }}
              >
                {isStaff ? 'Sign in to manage' : 'Sign in to buy'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isStaff
                  ? 'Admin runs the catalog. Sales reads it.'
                  : 'Pick up where you left off.'}
              </Typography>
            </Box>

            <Card sx={{ p: 3.5 }}>
              <LoginForm kind={kind} />
            </Card>

            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ textAlign: 'center' }}
            >
              Need the other side?{' '}
              <RouterLink
                to={isStaff ? '/customer-login' : '/login'}
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                {isStaff ? 'Customer sign-in' : 'Staff sign-in'}
              </RouterLink>
            </Typography>
          </Stack>

          {/* --- Right: fast-lane callout (md+ only) --- */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'sticky',
              top: 24,
            }}
          >
            <Card
              sx={{
                p: 3,
                background: theme.tokens.gradients.heroSoft,
                border: 'none',
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    color: theme.tokens.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BoltOutlinedIcon />
                </Box>
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    Fast lane
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Skip the form
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Demo splash logs you in with one click — customer,
                  admin, or sales. Use that if you're just here to
                  look around.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/')}
                >
                  Open demo splash
                </Button>
              </Stack>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
