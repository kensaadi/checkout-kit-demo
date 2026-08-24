import {
  Box,
  Breadcrumbs,
  Card,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import {
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';
import { InspectThisPage } from '../../components/demo/InspectThisPage';
import { ChangePasswordForm } from './ChangePasswordForm';

/**
 * Customer-only page for changing the sign-in password. Layout:
 * the form on the left, a sidebar with security tips + the
 * pattern explainer on the right (md+).
 *
 * The form itself (ChangePasswordForm + ChangePasswordFormBody)
 * is the canonical example of `useApiSubmit` + zod refine +
 * VALIDATION_ERROR.details auto-mapping — the kit's headline
 * error-handling story in three fields.
 */
export function ChangePasswordPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Stack spacing={3}>
      <Breadcrumbs separator="›" sx={{ fontSize: '0.85rem' }}>
        <Link
          component={RouterLink}
          to="/profile"
          underline="hover"
          color="text.secondary"
        >
          Profile
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>
          Change password
        </Typography>
      </Breadcrumbs>

      <Button
        onClick={() => navigate('/profile')}
        startIcon={<ArrowBackIcon />}
        variant="text"
        sx={{ alignSelf: 'flex-start' }}
      >
        Back to profile
      </Button>

      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Security
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Change password
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
          You'll need your current password to confirm. You stay
          signed in — use the new one next time you log in.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 320px' },
          alignItems: 'start',
        }}
      >
        <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <ChangePasswordForm />
        </Card>

        <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
          <Stack spacing={2}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                >
                  Strong password tips
                </Typography>
                <Tip label="At least 8 characters" />
                <Tip label="Mix uppercase + lowercase + digits" />
                <Tip label="Avoid words found in your email" />
                <Tip label="Don't reuse a password from another site" />
              </Stack>
            </Card>

            <Card
              sx={{
                p: 3,
                background: theme.tokens.gradients.heroSoft,
                border: 'none',
              }}
            >
              <Stack spacing={1}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                >
                  Demo highlight
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Wrong current password → field error
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Type the wrong current password and submit. The BE
                  returns{' '}
                  <Box component="code" sx={{ fontFamily: 'monospace' }}>
                    422
                  </Box>{' '}
                  with{' '}
                  <Box component="code" sx={{ fontFamily: 'monospace' }}>
                    details.currentPassword
                  </Box>
                  . useApiSubmit maps it to RHF setError — zero handler
                  code in the form body.
                </Typography>
              </Stack>
            </Card>
          </Stack>
        </Box>
      </Box>

      <InspectThisPage
        metadata={{
          title: 'Change password (validation showcase)',
          filePath: 'client/mui/src/features/profile/ChangePasswordPage.tsx',
          lines: 180,
          summary:
            "The canonical example of the kit's headline error story: client-side zod refine catches mismatch on confirmNewPassword, server-side returns 422 + details.currentPassword on wrong current password, useApiSubmit maps both to RHF field errors. Zero error-handler code in the form body — the whole story is implicit.",
          features: [
            'zod refine() for client-side confirmNewPassword === newPassword',
            'BE returns 422 + details map on wrong current password',
            'useApiSubmit reads details and calls rhf.setError() per field',
            'BE accepts confirmPassword (mapper renames confirmNewPassword)',
            'Two-column sticky layout with tips + pattern explainer',
          ],
          stack: ['React 19', 'MUI', '@dashforge/forms', 'zod'],
          endpoints: ['POST /v1/customer/change-password'],
        }}
      />
    </Stack>
  );
}

function Tip({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <CheckCircleOutlineIcon
        sx={{
          fontSize: 18,
          color: theme.tokens.colors.success,
          flexShrink: 0,
          mt: 0.2,
        }}
      />
      <Typography variant="body2" sx={{ color: 'text.primary' }}>
        {label}
      </Typography>
    </Stack>
  );
}
