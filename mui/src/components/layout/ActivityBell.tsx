import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmptyRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import { useNavigate } from 'react-router-dom';
import {
  admin_list_orders,
  list_my_orders,
} from '@api/orders/orders.service';
import type { Order, OrderStatus } from '@api/orders/orders.types';
import { useUser } from '@shared/store/user.store';

const POLL_INTERVAL_MS = 30_000;
const LAST_SEEN_KEY = 'checkout-kit:lastSeenActivityAt';
const MAX_FEED = 7;

/**
 * Topbar bell that surfaces recent order activity. Polls
 * `/v1/admin/orders` (staff) or `/v1/orders` (customer) every
 * 30 seconds and tracks an "unread" count based on the
 * timestamp of the newest event the user has acknowledged.
 *
 * Customer sees only their own orders. Staff sees all. Anonymous
 * users don't see the bell at all (the topbar only mounts when
 * authenticated).
 *
 * Polling stops when the document is hidden (tab in background)
 * so we don't drain mobile batteries during a demo session.
 */
export function ActivityBell() {
  const { user } = useUser();
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(LAST_SEEN_KEY) ?? '';
  });
  const pollTimer = useRef<number | undefined>(undefined);

  const isStaff =
    user?.roles.some((r) => r === 'admin' || r === 'sales') ?? false;
  const isCustomer = user?.roles.includes('customer') ?? false;

  const fetchActivity = useMemo(() => {
    if (isStaff) {
      return () => admin_list_orders({ page: 1, perPage: MAX_FEED });
    }
    if (isCustomer) {
      return () => list_my_orders({ page: 1, perPage: MAX_FEED });
    }
    return null;
  }, [isStaff, isCustomer]);

  useEffect(() => {
    if (!fetchActivity) return;

    let cancelled = false;
    function tick() {
      if (cancelled || !fetchActivity) return;
      if (document.hidden) {
        pollTimer.current = window.setTimeout(tick, POLL_INTERVAL_MS);
        return;
      }
      fetchActivity().then((r) => {
        if (cancelled) return;
        if (!r.error) {
          setOrders(r.data.data);
        }
        pollTimer.current = window.setTimeout(tick, POLL_INTERVAL_MS);
      });
    }
    tick();

    return () => {
      cancelled = true;
      if (pollTimer.current !== undefined) {
        window.clearTimeout(pollTimer.current);
      }
    };
  }, [fetchActivity]);

  const unreadCount = useMemo(() => {
    if (!lastSeenAt) return orders.length;
    return orders.filter((o) => o.createdAt > lastSeenAt).length;
  }, [orders, lastSeenAt]);

  function handleOpen(e: React.MouseEvent<HTMLElement>) {
    setAnchor(e.currentTarget);
    // Mark all visible as seen
    if (orders.length > 0) {
      const newest = orders[0]!.createdAt;
      setLastSeenAt(newest);
      try {
        window.localStorage.setItem(LAST_SEEN_KEY, newest);
      } catch {
        // private mode — drop silently
      }
    }
  }

  if (!user) return null;

  return (
    <>
      <Tooltip title="Recent activity" placement="bottom">
        <IconButton
          onClick={handleOpen}
          size="small"
          aria-label="Recent activity"
          sx={{
            color: theme.tokens.colors.textSecondary,
            width: 36,
            height: 36,
            borderRadius: theme.tokens.radius.pill + 'px',
            '&:hover': {
              color: theme.tokens.colors.primary,
              bgcolor: theme.tokens.colors.primarySoft,
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            // `rectangular` (the default) anchors the badge to the
            // icon's TOP-RIGHT CORNER. `circular` — which this used
            // to be — assumes a round child (e.g. an Avatar) and
            // pulls the badge inward by ~14%, so on this square icon
            // the badge sat ON TOP of the glyph and hid it. The bell
            // is not circular, so rectangular is correct.
            overlap="rectangular"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                // Nudge the badge just past the icon edge so the
                // glyph stays fully visible even at 2-digit counts.
                transform: 'scale(1) translate(40%, -35%)',
                transformOrigin: '100% 0%',
                animation:
                  unreadCount > 0
                    ? 'bellPulse 2.2s ease-in-out infinite'
                    : undefined,
                '@keyframes bellPulse': {
                  '0%, 100%': {
                    transform: 'scale(1) translate(40%, -35%)',
                  },
                  '50%': {
                    transform: 'scale(1.15) translate(40%, -35%)',
                  },
                },
              },
            }}
          >
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              minWidth: 340,
              maxWidth: 380,
              border: `1px solid ${theme.tokens.colors.borderSubtle}`,
              boxShadow: theme.tokens.shadow.lg,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="overline" color="text.secondary">
            Recent activity
          </Typography>
        </Box>
        <Divider />
        {orders.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nothing happening yet
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Orders will show up here as they come in.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {orders.slice(0, MAX_FEED).map((o) => (
              <ActivityRow
                key={o.id}
                order={o}
                isStaff={isStaff}
                onClick={() => {
                  setAnchor(null);
                  navigate(isStaff ? `/admin/orders/${o.id}` : `/orders/${o.id}`);
                }}
              />
            ))}
          </Stack>
        )}
        <Divider />
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            color="primary"
            sx={{
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => {
              setAnchor(null);
              navigate(isStaff ? '/admin/orders' : '/orders');
            }}
          >
            View all orders →
          </Typography>
        </Box>
      </Menu>
    </>
  );
}

function ActivityRow({
  order,
  isStaff,
  onClick,
}: {
  order: Order;
  isStaff: boolean;
  onClick: () => void;
}) {
  const theme = useTheme();
  const cfg = statusVisual(order.status, theme);
  const itemName = order.items[0]?.name ?? '—';
  const extra = order.items.length > 1 ? ` +${order.items.length - 1}` : '';

  return (
    <Box
      onClick={onClick}
      sx={{
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        transition: 'background-color .15s ease',
        '&:hover': { bgcolor: theme.tokens.colors.surfaceMuted },
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: cfg.bg,
            color: cfg.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 16 },
          }}
        >
          {cfg.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
            <Box component="span" sx={{ fontWeight: 600 }}>
              {cfg.title}
            </Box>{' '}
            <Box component="span" color="text.secondary">
              · {itemName}
              {extra}
            </Box>
          </Typography>
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: 'block', mt: 0.25 }}
          >
            {relativeTime(order.createdAt)}
            {isStaff && (
              <Box component="span" sx={{ ml: 0.5 }}>
                · {order.customerId.slice(-6)}
              </Box>
            )}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function statusVisual(
  status: OrderStatus,
  theme: Theme,
): { title: string; icon: React.ReactNode; bg: string; fg: string } {
  switch (status) {
    case 'paid':
      return {
        title: 'Order paid',
        icon: <CheckCircleOutlineIcon />,
        bg: theme.tokens.colors.successSoft,
        fg: theme.tokens.colors.success,
      };
    case 'pending_payment':
      return {
        title: 'Order pending',
        icon: <HourglassEmptyIcon />,
        bg: theme.tokens.colors.primarySoft,
        fg: theme.tokens.colors.primary,
      };
    case 'failed':
      return {
        title: 'Order failed',
        icon: <ErrorOutlineIcon />,
        bg: theme.tokens.colors.dangerSoft,
        fg: theme.tokens.colors.danger,
      };
    case 'refunded':
      return {
        title: 'Refunded',
        icon: <RefreshIcon />,
        bg: theme.tokens.colors.warningSoft,
        fg: theme.tokens.colors.warning,
      };
  }
}

/** Lightweight "2m ago" / "3h ago" / "2d ago" formatter. */
function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diffMs = Date.now() - t;
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
