import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Pagination,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { list_products } from '@api/products/products.service';
import type { ProductList } from '@api/products/products.types';
import { InspectThisPage } from '../../components/demo/InspectThisPage';
import { PageFadeIn } from '../../components/layout/PageFadeIn';
import { ProductCard } from './ProductCard';
import { ProductsTableView } from './ProductsTableView';

const PER_PAGE = 12;
const VIEW_KEY = 'checkout-kit:shopView';
type ShopView = 'card' | 'table';

function loadInitialView(): ShopView {
  if (typeof window === 'undefined') return 'card';
  const v = window.localStorage.getItem(VIEW_KEY);
  return v === 'table' ? 'table' : 'card';
}

/**
 * Public storefront. Two view modes: card grid (default) and
 * compact table. Preference is persisted in localStorage so the
 * user's pick survives reloads and tab restores.
 *
 * Calls the public `/v1/products` endpoint — drafts are hidden
 * BE-side. The admin counterpart lives in the admin feature
 * folder and shows drafts.
 */
export function ProductsListPage() {
  const [page, setPage] = useState(1);
  const [list, setList] = useState<ProductList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ShopView>(() => loadInitialView());
  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    list_products({ page, perPage: PER_PAGE }).then((r) => {
      if (cancelled) return;
      setLoading(false);
      if (r.error) {
        setError(r.error.message);
        return;
      }
      setList(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  function handleViewChange(
    _e: React.MouseEvent<HTMLElement>,
    next: ShopView | null,
  ) {
    if (!next) return; // ToggleButtonGroup allows null when clicking the active one
    setView(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // private mode / disabled storage — fine to drop
    }
  }

  const totalPages = list
    ? Math.max(1, Math.ceil(list.meta.total / list.meta.perPage))
    : 1;

  return (
    <Stack spacing={4}>
      {/* --- Hero banner --- */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: theme.tokens.radius.xl + 'px',
          background: theme.tokens.gradients.hero,
          color: 'white',
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        <Stack spacing={2} sx={{ position: 'relative', maxWidth: 720 }}>
          <Chip
            icon={<LocalOfferOutlinedIcon style={{ color: 'white' }} />}
            label="Demo catalog"
            size="small"
            sx={{
              alignSelf: 'flex-start',
              bgcolor: 'rgba(255,255,255,0.18)',
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-icon': { color: 'white' },
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.875rem', md: '2.5rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Buy something. Feels real.
          </Typography>
          <Typography
            sx={{
              fontSize: '1.05rem',
              opacity: 0.92,
              maxWidth: 580,
              lineHeight: 1.5,
            }}
          >
            Pick anything below. Add it to the cart. Walk through the
            full Stripe checkout. The flow is the kit — same code,
            same components, no shortcuts.
          </Typography>
        </Stack>
      </Box>

      {/* --- Header strip with view toggle --- */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 0.5,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'baseline' }}
        >
          <Typography variant="body2" color="text.secondary">
            {list
              ? `${list.meta.total} product${list.meta.total === 1 ? '' : 's'} available`
              : 'Loading catalog…'}
          </Typography>
          {list && totalPages > 1 && (
            <Typography variant="caption" color="text.disabled">
              · Page {page} of {totalPages}
            </Typography>
          )}
        </Stack>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          aria-label="View mode"
          sx={{
            bgcolor: 'background.paper',
            '& .MuiToggleButton-root': {
              border: `1px solid ${theme.tokens.colors.borderSubtle}`,
              px: 1.25,
              '&.Mui-selected': {
                bgcolor: theme.tokens.colors.primarySoft,
                color: theme.tokens.colors.primary,
                '&:hover': { bgcolor: theme.tokens.colors.primarySoft },
              },
            },
          }}
        >
          <ToggleButton value="card" aria-label="Card view">
            <Tooltip title="Card view" placement="bottom">
              <GridViewOutlinedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="table" aria-label="Table view">
            <Tooltip title="Table view" placement="bottom">
              <ViewListOutlinedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* --- Body --- */}
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : loading && !list ? (
        view === 'card' ? (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={360}
                sx={{ borderRadius: theme.tokens.radius.lg + 'px' }}
              />
            ))}
          </Box>
        ) : (
          <Skeleton
            variant="rounded"
            height={420}
            sx={{ borderRadius: theme.tokens.radius.lg + 'px' }}
          />
        )
      ) : !list || list.data.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: theme.tokens.radius.lg + 'px',
            border: `1px dashed ${theme.tokens.colors.borderDefault}`,
          }}
        >
          <Box sx={{ fontSize: '3rem', mb: 1 }}>🪧</Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            The catalog is empty
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Once products are published, they'll appear here.
          </Typography>
        </Box>
      ) : view === 'card' ? (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {list.data.map((product, i) => (
            <PageFadeIn key={product.id} delay={i * 60}>
              <ProductCard product={product} />
            </PageFadeIn>
          ))}
        </Box>
      ) : (
        <PageFadeIn>
          <ProductsTableView products={list.data} />
        </PageFadeIn>
      )}

      {list && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      <InspectThisPage
        metadata={{
          title: 'Storefront grid + table',
          filePath: 'client/mui/src/features/storefront/ProductsListPage.tsx',
          lines: 250,
          summary:
            'Public catalog with two layouts: card grid (immersive) and compact table (dense). Preference persists in localStorage. Drafts are hidden by the BE; admin counterpart shows them.',
          features: [
            'Card / Table toggle persisted in localStorage',
            'Skeleton tuned per view (grid skeleton vs single block)',
            'Active-only public visibility (drafts 404 to public)',
            'Money color on price across both layouts',
            'Pagination shared across views',
          ],
          stack: ['React 19', 'MUI', 'Zod contracts'],
          endpoints: ['GET /v1/products?page=N&perPage=12'],
        }}
      />
    </Stack>
  );
}
