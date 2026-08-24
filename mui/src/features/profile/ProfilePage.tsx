import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useNavigate } from 'react-router-dom';
import { get_customer_me } from '@api/me/me.service';
import { userStore, useUser } from '@shared/store/user.store';
import { InspectThisPage } from '../../components/demo/InspectThisPage';
import { ProfileForm } from './ProfileForm';

/**
 * Customer profile page. Edit form + a link out to the
 * change-password sub-route. Email is shown read-only (changing
 * email requires a verification flow — that's registration-kit's
 * territory, out of scope here).
 *
 * Layout: form on the left, security panel + "RBAC explainer"
 * card on the right (md+). The RBAC card is the demo gold for
 * sales users — they see the same page but every input is locked
 * with an icon and a tooltip explaining why.
 *
 * On mount, fetches `/v1/customer/me` as a safeguard — userStore
 * may have stale fields after a long-lived session; this refresh
 * keeps the form pre-filled with whatever the BE thinks is current.
 */
export function ProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    get_customer_me().then((r) => {
      if (cancelled) return;
      setRefreshing(false);
      if (r.error) {
        setError(r.error.message);
        return;
      }
      if (userStore.user) {
        userStore.user = {
          ...userStore.user,
          id: r.data.id,
          email: r.data.email,
          firstName: r.data.firstName,
          lastName: r.data.lastName,
        };
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (refreshing && !user) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={200} height={48} />
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '1fr 320px' },
          }}
        >
          <Skeleton variant="rounded" height={420} />
          <Skeleton variant="rounded" height={320} />
        </Box>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user) return null;

  return (
    <Stack spacing={3}>
      {/* --- Hero --- */}
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: 'block', mb: 0.5 }}
        >
          You
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Your account
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {user.roles.map((role) => (
            <Chip
              key={role}
              label={role}
              size="small"
              sx={{
                bgcolor: theme.tokens.colors.primarySoft,
                color: theme.tokens.colors.primary,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            />
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 320px' },
          alignItems: 'start',
        }}
      >
        {/* --- Left: form --- */}
        <Stack spacing={3}>
          <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  Personal details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Shown on your receipts. Also handed to Stripe as the
                  Customer name.
                </Typography>
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', mb: 0.25 }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Email
                  </Typography>
                  <Tooltip
                    title="Email changes go through verification — that flow lives in registration-kit."
                    placement="top"
                  >
                    <LockOutlinedIcon
                      sx={{
                        fontSize: 14,
                        color: theme.tokens.colors.textMuted,
                      }}
                    />
                  </Tooltip>
                </Stack>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {user.email}
                </Typography>
              </Box>

              <Divider />

              <ProfileForm />
            </Stack>
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: theme.tokens.colors.primarySoft,
                    color: theme.tokens.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Password
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Change your sign-in password.
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="outlined"
                onClick={() => navigate('/profile/change-password')}
                startIcon={<VpnKeyOutlinedIcon />}
              >
                Change password
              </Button>
            </Stack>
          </Card>
        </Stack>

        {/* --- Right: RBAC explainer (demo gold for sales) --- */}
        <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
          <Card
            sx={{
              p: 3,
              background: theme.tokens.gradients.heroSoft,
              border: 'none',
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  Field-level RBAC
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Same page, different abilities
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Try this page as <strong>Sales</strong> via the demo
                splash. Every editable input becomes read-only with a{' '}
                <LockOutlinedIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} />{' '}
                lock — without rerendering, without redirects.
              </Typography>
              <Stack spacing={1}>
                <RbacRow
                  icon={<MarkEmailReadOutlinedIcon fontSize="small" />}
                  label="Email"
                  hint="Locked by design (verification flow lives elsewhere)"
                />
                <RbacRow
                  icon={<LockOutlinedIcon fontSize="small" />}
                  label="Name fields"
                  hint="Editable for customer, read-only for sales"
                />
                <RbacRow
                  icon={<ShieldOutlinedIcon fontSize="small" />}
                  label="Password CTA"
                  hint="Self-service only — hidden on staff views"
                />
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Box>

      <InspectThisPage
        metadata={{
          title: 'Customer profile + field-level RBAC',
          filePath: 'client/mui/src/features/profile/ProfilePage.tsx',
          lines: 280,
          summary:
            'Customer self-service profile. Email is locked (no edit, registration-kit owns email verification). First+last name editable via @dashforge/forms with field-level access props. RBAC gold: a sales user lands here and every input becomes read-only with a lock icon — same JSX, different abilities.',
          features: [
            'Field-level access via access={{resource, action, onUnauthorized: "readonly"}}',
            'On-mount refresh from BE keeps userStore in sync',
            'VALIDATION_ERROR.details auto-mapped to RHF field errors',
            'Email lock tooltip explains the registration-kit boundary',
            'Two-column sticky layout with RBAC explainer on md+',
          ],
          stack: ['React 19', 'MUI', '@dashforge/forms', '@dashforge/rbac'],
          endpoints: [
            'GET /v1/customer/me',
            'PATCH /v1/customer/me',
          ],
        }}
      />
    </Stack>
  );
}

function RbacRow({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'flex-start',
        bgcolor: 'background.paper',
        borderRadius: theme.tokens.radius.sm + 'px',
        p: 1.25,
      }}
    >
      <Box
        sx={{
          color: theme.tokens.colors.primary,
          mt: 0.25,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      </Box>
    </Stack>
  );
}
