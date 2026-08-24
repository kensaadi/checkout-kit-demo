import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Chip,
  Divider,
  Link,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  Link as RouterLink,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  get_product_by_slug,
  list_products,
} from '@api/products/products.service';
import type { Product } from '@api/products/products.types';
import { InspectThisPage } from '../../components/demo/InspectThisPage';
import { formatPrice } from '../cart/format';
import { AddToCartButton } from './AddToCartButton';
import { ProductCard } from './ProductCard';

/**
 * Single product page. Layout: large cover on the left with
 * gallery thumbnails below; details + price + AddToCartButton
 * on the right. Below the fold: a "Related products" grid
 * pulled from the public catalog (excluding the current item).
 *
 * Sticky cart bar appears on mobile (xs/sm) so the buy CTA is
 * always reachable while reading the description.
 *
 * 404 case shows a friendly message + back link instead of a
 * dead end.
 */
export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Set of image URLs that failed to load. Populated by <img onError>.
  // Rendering paths consult it to fall through to the placeholder
  // instead of showing the browser's broken-image icon. Reset on slug
  // change so a new product starts with a clean tracking slate.
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const markImageBroken = (url: string) => {
    setBrokenImages((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  useEffect(() => {
    if (!slug) {
      setError('Missing product slug in URL');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRelated([]);
    setBrokenImages(new Set());

    Promise.all([
      get_product_by_slug(slug),
      list_products({ page: 1, perPage: 8 }),
    ]).then(([productR, listR]) => {
      if (cancelled) return;
      setLoading(false);
      if (productR.error) {
        setError(productR.error.message);
        return;
      }
      setProduct(productR.data);
      setActiveImage(
        productR.data.coverUrl ?? productR.data.galleryUrls?.[0] ?? null,
      );
      if (!listR.error) {
        setRelated(
          listR.data.data
            .filter((p) => p.slug !== slug)
            .slice(0, 3),
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={200} height={32} />
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          <Skeleton
            variant="rounded"
            sx={{ aspectRatio: '4 / 3', borderRadius: 2 }}
          />
          <Stack spacing={2}>
            <Skeleton variant="text" width="70%" height={48} />
            <Skeleton variant="text" width={120} height={48} />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
          </Stack>
        </Box>
      </Stack>
    );
  }

  if (error || !product) {
    return (
      <Stack spacing={2}>
        <Button
          onClick={() => navigate('/shop')}
          startIcon={<ArrowBackIcon />}
          variant="text"
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to shop
        </Button>
        <Alert severity="error">{error ?? 'Product not found'}</Alert>
      </Stack>
    );
  }

  const allImages = [
    product.coverUrl,
    ...(product.galleryUrls ?? []),
  ].filter((u): u is string => Boolean(u));
  const activeImageBroken =
    Boolean(activeImage) && brokenImages.has(activeImage!);

  return (
    <Stack spacing={4} sx={{ pb: { xs: 12, md: 0 } }}>
      <Breadcrumbs separator="›" sx={{ fontSize: '0.85rem' }}>
        <Link
          component={RouterLink}
          to="/shop"
          underline="hover"
          color="text.secondary"
        >
          Shop
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>
          {product.name}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 3, md: 5 },
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'start',
        }}
      >
        {/* --- Image column --- */}
        <Stack spacing={1.5}>
          <Box
            sx={{
              aspectRatio: '4 / 3',
              borderRadius: theme.tokens.radius.lg + 'px',
              overflow: 'hidden',
              bgcolor: theme.tokens.colors.surfaceMuted,
              boxShadow: theme.tokens.shadow.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {activeImage && !activeImageBroken ? (
              <Box
                component="img"
                src={activeImage}
                alt={product.name}
                onError={() => markImageBroken(activeImage)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'opacity .25s ease',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: theme.tokens.gradients.heroSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '6rem',
                    fontWeight: 800,
                    color: theme.tokens.colors.primary,
                    opacity: 0.45,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {product.name.charAt(0)}
                </Typography>
              </Box>
            )}
          </Box>

          {allImages.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {allImages.map((url) => {
                const thumbBroken = brokenImages.has(url);
                return (
                <Box
                  key={url}
                  component="button"
                  onClick={() => setActiveImage(url)}
                  aria-label="Switch image"
                  sx={{
                    width: 72,
                    height: 72,
                    p: 0,
                    border: '2px solid',
                    borderColor:
                      activeImage === url
                        ? theme.tokens.colors.primary
                        : theme.tokens.colors.borderSubtle,
                    borderRadius: theme.tokens.radius.md + 'px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: 'transparent',
                    transition: 'border-color .2s ease, transform .15s ease',
                    '&:hover': {
                      borderColor: theme.tokens.colors.primary,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {thumbBroken ? (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        background: theme.tokens.gradients.heroSoft,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: theme.tokens.colors.primary,
                          opacity: 0.45,
                        }}
                      >
                        {product.name.charAt(0)}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      component="img"
                      src={url}
                      alt=""
                      onError={() => markImageBroken(url)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  )}
                </Box>
                );
              })}
            </Stack>
          )}
        </Stack>

        {/* --- Details column --- */}
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Chip
                label="In stock"
                size="small"
                sx={{
                  bgcolor: theme.tokens.colors.successSoft,
                  color: theme.tokens.colors.success,
                  fontWeight: 700,
                }}
              />
              <Chip
                label="Stripe-secured"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Stack>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.875rem', md: '2.25rem' },
                mb: 1,
              }}
            >
              {product.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: 'block', fontFamily: 'monospace' }}
            >
              {product.slug}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                color: theme.tokens.colors.money,
                lineHeight: 1,
              }}
            >
              {formatPrice(product.price, product.currency)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5 }}
            >
              {product.currency.toUpperCase()} · one-time payment
            </Typography>
          </Box>

          <Divider />

          {product.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
            >
              {product.description}
            </Typography>
          )}

          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', mb: 1.25 }}
            >
              What's included
            </Typography>
            <Stack spacing={1}>
              <PerkRow
                icon={<VerifiedOutlinedIcon fontSize="small" />}
                label="Instant access after payment"
              />
              <PerkRow
                icon={<BoltOutlinedIcon fontSize="small" />}
                label="Stripe-secured checkout · test card 4242 4242 4242 4242"
              />
              <PerkRow
                icon={<RefreshOutlinedIcon fontSize="small" />}
                label="Lifetime updates on the kit you bought"
              />
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <AddToCartButton productId={product.id} />
          </Box>
        </Stack>
      </Box>

      {related.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2.5 }}>
            You might also like
          </Typography>
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
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Box>
        </Box>
      )}

      {/* Sticky cart bar on mobile only. */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'background.paper',
          borderTop: `1px solid ${theme.tokens.colors.borderSubtle}`,
          px: 2,
          py: 1.5,
          zIndex: 1100,
          boxShadow: theme.tokens.shadow.lg,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              {product.name}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                color: theme.tokens.colors.primary,
                lineHeight: 1.1,
              }}
            >
              {formatPrice(product.price, product.currency)}
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <AddToCartButton productId={product.id} />
          </Box>
        </Stack>
      </Box>

      <InspectThisPage
        metadata={{
          title: 'Product detail with gallery + related',
          filePath:
            'client/mui/src/features/storefront/ProductDetailPage.tsx',
          lines: 320,
          summary:
            'Two-column hero with cover + clickable thumb gallery, price/perks/CTA on the right, sticky cart bar on mobile. Below the fold: 3 related products from the public catalog excluding the current item.',
          features: [
            'Breadcrumb + lazy-loaded "related products" via list_products',
            'Sticky add-to-cart on mobile (fixed bottom bar)',
            'AddToCartButton gated by <Can resource="cart" action="create">',
            'Image gallery with thumbnail nav + active highlight',
            'Skeleton split layout while fetching',
          ],
          stack: ['React 19', 'MUI', '@dashforge/rbac'],
          endpoints: [
            'GET /v1/products/:slug',
            'GET /v1/products?page=1&perPage=8 (related)',
            'POST /v1/cart/items',
          ],
        }}
      />
    </Stack>
  );
}

function PerkRow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: theme.tokens.colors.primarySoft,
          color: theme.tokens.colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.primary">
        {label}
      </Typography>
    </Stack>
  );
}
