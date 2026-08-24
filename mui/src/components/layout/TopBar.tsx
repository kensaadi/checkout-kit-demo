import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';
import {
  Link as RouterLink,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { logout } from '@shared/store/auth.store';
import { resetCartStore } from '@shared/store/cart.store';
import { useUser } from '@shared/store/user.store';
import { CartButton } from '../../features/cart/CartButton';
import { ActivityBell } from './ActivityBell';
import { BrandMark } from './BrandMark';
import { ThemeModeToggle } from './ThemeModeToggle';

/**
 * Top bar shown above every authenticated page. Layout:
 *
 *   [BrandMark + wordmark]   [nav, role-filtered]    [Cart  Avatar▾]
 *
 * Nav items underline on hover and stay underlined when the
 * current route matches — small detail but visually anchors the
 * user's location.
 *
 * The avatar opens a menu with Profile + Change password +
 * Sign out. Sign-out orchestrates the cross-store reset
 * (auth.store + cart.store) — keep the sequence in sync with
 * `logout()` if a new persisted store joins the kit.
 */
export function TopBar() {
  const { user } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  function handleSignOut() {
    setMenuAnchor(null);
    logout();
    resetCartStore();
    navigate('/');
  }

  const isCustomer = user?.roles.includes('customer') ?? false;
  const isStaff =
    user?.roles.some((r) => r === 'admin' || r === 'sales') ?? false;

  const customerNav = [
    { to: '/shop', label: 'Shop' },
    { to: '/orders', label: 'My orders' },
  ];
  const staffNav = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/orders', label: 'All orders' },
  ];
  const nav = isCustomer ? customerNav : isStaff ? staffNav : [];

  const initials = user ? computeInitials(user).toUpperCase() : '';

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 2, minHeight: { xs: 64, md: 72 } }}>
        <Button
          component={RouterLink}
          to="/welcome"
          sx={{
            color: 'inherit',
            textTransform: 'none',
            p: 0.5,
            '&:hover': { bgcolor: 'transparent' },
          }}
        >
          <BrandMark
            size={32}
            withWordmark
            wordmarkSx={{ display: { xs: 'none', sm: 'inline-block' } }}
          />
        </Button>

        {user && nav.length > 0 && (
          <Stack
            direction="row"
            spacing={{ xs: 0, sm: 0.5 }}
            sx={{ flexGrow: 1, ml: { xs: 0.5, sm: 2 }, alignItems: 'center' }}
          >
            {nav.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} />
            ))}
          </Stack>
        )}

        {!user && <Box sx={{ flexGrow: 1 }} />}

        {user && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ActivityBell />
            <Box sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              <ThemeModeToggle />
            </Box>
            {isCustomer && <CartButton />}
            <Button
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{
                p: 0.5,
                pr: 1.5,
                gap: 1,
                borderRadius: theme.tokens.radius.pill + 'px',
                color: 'text.primary',
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  bgcolor: theme.tokens.colors.primary,
                  color: theme.tokens.colors.textInverse,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', lineHeight: 1, fontWeight: 500 }}
                >
                  Signed in
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.2,
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={menuAnchor !== null}
              onClose={() => setMenuAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    border: `1px solid ${theme.tokens.colors.borderSubtle}`,
                    boxShadow: theme.tokens.shadow.lg,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {isCustomer && (
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    navigate('/profile');
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
              )}
              {isCustomer && (
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    navigate('/profile/change-password');
                  }}
                >
                  <ListItemIcon>
                    <KeyIcon fontSize="small" />
                  </ListItemIcon>
                  Change password
                </MenuItem>
              )}
              {isCustomer && <Divider />}
              <MenuItem onClick={handleSignOut}>
                <ListItemIcon>
                  <LogoutIcon
                    fontSize="small"
                    sx={{ color: theme.tokens.colors.danger }}
                  />
                </ListItemIcon>
                <Typography color={theme.tokens.colors.danger}>
                  Sign out
                </Typography>
              </MenuItem>
            </Menu>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}

/** Picks one or two initial characters from name / first+last / email. */
function computeInitials(user: {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
}): string {
  if (user.name) return user.name.charAt(0);
  const fl =
    (user.firstName?.charAt(0) ?? '') + (user.lastName?.charAt(0) ?? '');
  if (fl) return fl;
  return user.email.charAt(0);
}

/** Topbar nav link with hover underline + active state. */
function NavItem({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const theme = useTheme();
  const isActive = location.pathname === to;

  return (
    <Button
      component={NavLink}
      to={to}
      size="small"
      sx={{
        color: isActive ? 'primary.main' : 'text.primary',
        fontWeight: isActive ? 700 : 500,
        position: 'relative',
        px: { xs: 0.75, sm: 1.5 },
        minWidth: 0,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 4,
          height: 2,
          borderRadius: 999,
          bgcolor: isActive ? theme.tokens.colors.primary : 'transparent',
          transition: 'background-color .2s ease, opacity .2s ease',
        },
        '&:hover': {
          color: 'primary.main',
          bgcolor: 'transparent',
          '&::after': {
            bgcolor: theme.tokens.colors.primary,
            opacity: 0.4,
          },
        },
      }}
    >
      {label}
    </Button>
  );
}
