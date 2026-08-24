import {
  Alert,
  Box,
  Breadcrumbs,
  Card,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import { Can } from '@dashforge/rbac';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import {
  Link as RouterLink,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { InspectThisPage } from '../../../components/demo/InspectThisPage';
import { AdminProductForm } from './AdminProductForm';

/**
 * Create-product page. Gated at the route level (StaffGuard) and
 * again at the page level via `<Can>` on `products:create` — a
 * sales user that landed here by URL is redirected away.
 *
 * After creation the form navigates to /admin/products/:id so
 * the new product's image management is immediately accessible.
 *
 * The image-upload section is intentionally NOT here: an image
 * upload needs a product id, which only exists after Create. The
 * form's redirect to /admin/products/:id is the seamless handoff.
 */
export function AdminProductCreatePage() {
  const navigate = useNavigate();

  return (
    <Can
      action="create"
      resource="products"
      fallback={<Navigate to="/admin/products" replace />}
    >
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
            New
          </Typography>
        </Breadcrumbs>

        <Button
          onClick={() => navigate('/admin/products')}
          startIcon={<ArrowBackIcon />}
          variant="text"
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to products
        </Button>

        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
            New product
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Save the basics first — you'll be able to upload images on
            the edit page right after.
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
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', mb: 2 }}
            >
              Basics
            </Typography>
            <AdminProductForm mode="create" />
          </Card>

          <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
            <Alert
              icon={<ImageOutlinedIcon />}
              severity="info"
              variant="outlined"
              sx={{ alignItems: 'flex-start' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Images come next
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cover + gallery upload to S3 (10 MB cap, image/* only)
                lands on the edit page after you save. The
                product id is needed to namespace the upload key.
              </Typography>
            </Alert>
          </Box>
        </Box>

        <InspectThisPage
          metadata={{
            title: 'New product form',
            filePath:
              'client/mui/src/features/admin/products/AdminProductCreatePage.tsx',
            lines: 110,
            summary:
              'Sales users that land here by URL get redirected away (Can fallback Navigate). Admin sees the form. On save: POST /v1/admin/products → 201 → navigate to /admin/products/:newId so image upload is one click away.',
            features: [
              'Page-level RBAC gate via <Can action="create"> + Navigate fallback',
              'Form-level field RBAC (price + slug + currency + active)',
              'POST-create handoff to /admin/products/:id for image upload',
              'Slug uniqueness validated server-side (409 → form error)',
            ],
            stack: ['React 19', 'MUI', '@dashforge/forms', '@dashforge/rbac'],
            endpoints: ['POST /v1/admin/products'],
          }}
        />
      </Stack>
    </Can>
  );
}
