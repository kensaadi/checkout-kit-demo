import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Card,
  Chip,
  Link,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import { Can } from '@dashforge/rbac';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Link as RouterLink,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { admin_get_product_by_id } from '@api/products/products.service';
import type { Product } from '@api/products/products.types';
import { InspectThisPage } from '../../../components/demo/InspectThisPage';
import { AdminProductForm } from './AdminProductForm';
import { DeleteProductDialog } from './DeleteProductDialog';
import { ProductImagesPanel } from './ProductImagesPanel';

/**
 * Edit-product page. Fetches the product by id on mount, hydrates
 * the form with its values, and shows the ProductImagesPanel
 * below for cover + gallery management.
 *
 * Layout: form on the left, images panel on the right (md+).
 * On mobile the panel stacks below the form.
 *
 * The whole route is gated by StaffGuard (sales + admin). Sales
 * sees the page and the form, but every field is RBAC-readonly
 * because `products:update` is admin-only. The Delete button is
 * separately gated by `products:delete` via `<Can>`.
 */
export function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Missing product id in URL');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    admin_get_product_by_id(id).then((r) => {
      if (cancelled) return;
      setLoading(false);
      if (r.error) {
        setError(r.error.message);
        return;
      }
      setProduct(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={220} height={28} />
        <Skeleton variant="text" width="60%" height={48} />
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
          }}
        >
          <Skeleton variant="rounded" height={520} />
          <Skeleton variant="rounded" height={420} />
        </Box>
      </Stack>
    );
  }

  if (error || !product) {
    return (
      <Stack spacing={2}>
        <Button
          onClick={() => navigate('/admin/products')}
          startIcon={<ArrowBackIcon />}
          variant="text"
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to products
        </Button>
        <Alert severity="error">{error ?? 'Product not found'}</Alert>
      </Stack>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <Breadcrumbs separator="›" sx={{ fontSize: '0.85rem' }}>
          <Link
            component={RouterLink}
            to="/admin/products"
            underline="hover"
            color="text.secondary"
          >
            Products
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { sm: 'center' },
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 1, alignItems: 'center', flexWrap: 'wrap' }}
            >
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
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontFamily: 'monospace' }}
              >
                {product.id}
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {product.name}
            </Typography>
          </Box>

          <Can action="delete" resource="products" fallback={null}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
              sx={{ alignSelf: 'flex-start', flexShrink: 0 }}
            >
              Delete
            </Button>
          </Can>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '1fr 380px' },
            alignItems: 'start',
          }}
        >
          <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', mb: 2 }}
            >
              Basics
            </Typography>
            <AdminProductForm
              mode="edit"
              editId={product.id}
              initial={product}
            />
          </Card>

          <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
            <ProductImagesPanel
              product={product}
              onProductUpdated={setProduct}
            />
          </Box>
        </Box>
      </Stack>

      <InspectThisPage
        metadata={{
          title: 'Admin product editor + S3 images',
          filePath:
            'client/mui/src/features/admin/products/AdminProductEditPage.tsx',
          lines: 200,
          summary:
            'Two-column layout: form on the left, ProductImagesPanel sticky on the right with drag-drop cover + gallery upload. Sales users see the same page but every field renders read-only via field-level RBAC (access prop), and the upload + Delete buttons disappear entirely.',
          features: [
            'Field-level RBAC via access={{resource, action, onUnauthorized}}',
            'Drag-drop image upload directly to S3 (BE-side)',
            '10 MB cap + MIME whitelist (image/png|jpg|webp) enforced server-side',
            'Optimistic preview as the image uploads',
            'Live "Customers see: $X.XX" preview from cents input',
            'Active/Draft toggle controls public storefront visibility',
          ],
          stack: ['React 19', 'MUI', '@dashforge/forms', '@dashforge/rbac'],
          endpoints: [
            'GET /v1/admin/products/:id',
            'PATCH /v1/admin/products/:id',
            'POST /v1/admin/products/:id/cover (multipart)',
            'POST /v1/admin/products/:id/gallery (multipart)',
            'DELETE /v1/admin/products/:id/cover',
            'DELETE /v1/admin/products/:id/gallery',
          ],
        }}
      />

      <DeleteProductDialog
        open={deleteOpen}
        product={product}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
