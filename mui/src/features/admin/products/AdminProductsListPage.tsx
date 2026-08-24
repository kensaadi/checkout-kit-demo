import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Pagination,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import { Can } from '@dashforge/rbac';
import AddIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/SearchRounded';
import { useNavigate } from 'react-router-dom';
import {
  EmptyCatalogIllustration,
  NoSearchResultsIllustration,
} from '../../../components/illustrations';
import { admin_list_products } from '@api/products/products.service';
import type {
  Product,
  ProductList,
} from '@api/products/products.types';
import { InspectThisPage } from '../../../components/demo/InspectThisPage';
import { formatPrice } from '../../cart/format';
import { formatDateTime, shortenId } from '../../orders/format';
import { DeleteProductDialog } from './DeleteProductDialog';

const PER_PAGE = 20;

/**
 * Staff view of the full catalog — drafts visible, paginated.
 *
 * Row actions:
 *   - Edit  → /admin/products/:id  (gated by products:update via Can on the icon)
 *   - Delete → confirm dialog       (gated by products:delete via Can)
 *
 * "Create product" CTA in the header is gated by products:create.
 * A sales user reaches the page (StaffGuard allows admin+sales),
 * sees the catalog, can click into edit pages — but the edit
 * form's individual fields render read-only (via `access` props
 * inside AdminProductFormBody). Page-level redirects unused —
 * RBAC degrades the surface gracefully field by field.
 *
 * Search input filters client-side on name + slug. Pagination
 * stays server-side; the search clears its own page count once
 * the catalog grows past one page worth of filtered matches.
 */
export function AdminProductsListPage() {
  const [page, setPage] = useState(1);
  const [list, setList] = useState<ProductList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  function refresh() {
    setLoading(true);
    setError(null);
    return admin_list_products({ page, perPage: PER_PAGE }).then((r) => {
      setLoading(false);
      if (r.error) {
        setError(r.error.message);
        return;
      }
      setList(r.data);
    });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    admin_list_products({ page, perPage: PER_PAGE }).then((r) => {
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

  const filtered = useMemo(() => {
    if (!list) return [];
    const q = search.trim().toLowerCase();
    if (!q) return list.data;
    return list.data.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [list, search]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const totalPages = list
    ? Math.max(1, Math.ceil(list.meta.total / list.meta.perPage))
    : 1;

  const activeCount = list?.data.filter((p) => p.active).length ?? 0;
  const draftCount = list?.data.filter((p) => !p.active).length ?? 0;

  return (
    <>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Box>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Products
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {list ? `${list.meta.total} in the catalog` : 'Loading…'}
              {list && (
                <>
                  {' · '}
                  <Box
                    component="span"
                    sx={{ color: theme.tokens.colors.success, fontWeight: 600 }}
                  >
                    {activeCount} active
                  </Box>
                  {' · '}
                  <Box
                    component="span"
                    sx={{ color: theme.tokens.colors.warning, fontWeight: 600 }}
                  >
                    {draftCount} draft{draftCount === 1 ? '' : 's'}
                  </Box>
                </>
              )}
            </Typography>
          </Box>

          <Can action="create" resource="products" fallback={null}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
              onClick={() => navigate('/admin/products/new')}
            >
              New product
            </Button>
          </Can>
        </Stack>

        <TextField
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 360 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: theme.tokens.colors.textMuted }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />

        {loading && !list ? (
          <Card sx={{ p: 0 }}>
            <Box sx={{ p: 2.5 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Stack
                  key={i}
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', py: 1.5 }}
                >
                  <Skeleton variant="rounded" width={48} height={48} />
                  <Stack spacing={0.5} sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="25%" />
                  </Stack>
                  <Skeleton variant="text" width={80} />
                  <Skeleton variant="text" width={120} />
                </Stack>
              ))}
            </Box>
          </Card>
        ) : list && filtered.length === 0 && search ? (
          <Card sx={{ p: 6 }}>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <NoSearchResultsIllustration size={160} />
              <Typography variant="h6">No matches for "{search}"</Typography>
              <Typography variant="body2" color="text.secondary">
                Try a different name or slug fragment, or clear the search.
              </Typography>
              <Button variant="text" onClick={() => setSearch('')}>
                Clear search
              </Button>
            </Stack>
          </Card>
        ) : list && list.data.length === 0 ? (
          <Card sx={{ p: 6 }}>
            <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <EmptyCatalogIllustration size={200} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Nothing to sell yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your first product is one click away.
                </Typography>
              </Box>
              <Can action="create" resource="products" fallback={null}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/products/new')}
                >
                  New product
                </Button>
              </Can>
            </Stack>
          </Card>
        ) : (
          <Card sx={{ p: 0, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((product) => (
                    <TableRow
                      key={product.id}
                      hover
                      onClick={() =>
                        navigate(`/admin/products/${product.id}`)
                      }
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.75}
                          sx={{ alignItems: 'center' }}
                        >
                          <Avatar
                            variant="rounded"
                            src={product.coverUrl ?? undefined}
                            alt=""
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: theme.tokens.colors.surfaceMuted,
                              color: theme.tokens.colors.primary,
                              fontWeight: 700,
                              borderRadius: theme.tokens.radius.md + 'px',
                            }}
                          >
                            {product.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                              noWrap
                            >
                              {product.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{
                                fontFamily: 'monospace',
                                display: 'block',
                              }}
                            >
                              {shortenId(product.id)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'monospace',
                          color: 'text.secondary',
                        }}
                      >
                        {product.slug}
                      </TableCell>
                      <TableCell>
                        {product.active ? (
                          <Chip
                            label="Active"
                            size="small"
                            sx={{
                              bgcolor: theme.tokens.colors.successSoft,
                              color: theme.tokens.colors.success,
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          <Chip
                            label="Draft"
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: theme.tokens.colors.warning,
                              color: theme.tokens.colors.warning,
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontVariantNumeric: 'tabular-nums',
                          fontWeight: 600,
                        }}
                      >
                        {formatPrice(product.price, product.currency)}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {formatDateTime(product.updatedAt)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        <Can
                          action="update"
                          resource="products"
                          fallback={null}
                        >
                          <IconButton
                            size="small"
                            aria-label="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/products/${product.id}`);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Can>
                        <Can
                          action="delete"
                          resource="products"
                          fallback={null}
                        >
                          <IconButton
                            size="small"
                            aria-label="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(product);
                            }}
                            sx={{
                              color: theme.tokens.colors.danger,
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Can>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_e, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Stack>

      <InspectThisPage
        metadata={{
          title: 'Admin products list',
          filePath:
            'client/mui/src/features/admin/products/AdminProductsListPage.tsx',
          lines: 360,
          summary:
            'Staff catalog management. Drafts visible (unlike the public /shop), thumbnails in the row, client-side search on name + slug, server pagination. Edit and Delete are per-row RBAC-gated: a sales token sees the page and the icons disappear; admin sees both.',
          features: [
            '<Can action resource> per-action gating (no role hard-coding)',
            'Thumbnail cell hydrated from product.coverUrl',
            'Client-side search overlay + empty-no-matches state',
            'Skeleton table while loading (no spinner, no shift)',
            'Branded empty-catalog state with CTA',
            'Active/Draft chip with brand-accent colors',
          ],
          stack: ['React 19', 'MUI', '@dashforge/rbac'],
          endpoints: ['GET /v1/admin/products?page=N&perPage=20'],
        }}
      />

      {deleteTarget && (
        <DeleteProductDialog
          open={Boolean(deleteTarget)}
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            refresh();
          }}
        />
      )}
    </>
  );
}
