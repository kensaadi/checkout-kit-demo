import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@api/products/products.types';
import { formatPrice } from '../cart/format';

/**
 * Product tile rendered in the storefront grid. The whole card
 * is the click target (CardActionArea) — no separate "View"
 * button. Navigates to `/shop/:slug`.
 *
 * Missing `coverUrl` → renders an accent gradient with the first
 * letter of the name as a centred glyph, so the grid stays
 * visually uniform even with sparse images.
 *
 * Hover micro-interactions:
 *   - card lifts (translateY) + shadow grows
 *   - cover image zooms in slightly via `transform: scale`
 *   - "View →" affordance fades in next to the title
 *
 * Broken-image guard: if `coverUrl` fails to load (404 / net error),
 * onError trips coverBroken and we fall through to the same first-
 * letter placeholder used when coverUrl is null. Prevents CDN / seed
 * URL drift from leaving a broken-image icon in the grid.
 */
export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [coverBroken, setCoverBroken] = useState(false);

  // Reset the broken flag when the underlying URL changes — otherwise
  // navigating between products would carry a stale error state and
  // the placeholder would show even for a working new URL.
  useEffect(() => {
    setCoverBroken(false);
  }, [product.coverUrl]);

  const showImage = Boolean(product.coverUrl) && !coverBroken;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.tokens.shadow.md,
          borderColor: theme.tokens.colors.primary,
        },
        '&:hover .pc-cover': {
          transform: 'scale(1.04)',
        },
        '&:hover .pc-cta': {
          opacity: 1,
          transform: 'translateX(0)',
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/shop/${product.slug}`)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            bgcolor: theme.tokens.colors.surfaceMuted,
          }}
        >
          {showImage ? (
            <Box
              component="img"
              src={product.coverUrl!}
              alt={product.name}
              loading="lazy"
              onError={() => setCoverBroken(true)}
              className="pc-cover"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform .5s ease',
                display: 'block',
              }}
            />
          ) : (
            <Box
              className="pc-cover"
              sx={{
                width: '100%',
                height: '100%',
                background: theme.tokens.gradients.heroSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform .5s ease',
              }}
            >
              <Typography
                sx={{
                  fontSize: '3.5rem',
                  fontWeight: 800,
                  color: theme.tokens.colors.primary,
                  opacity: 0.4,
                  letterSpacing: '-0.04em',
                }}
              >
                {product.name.charAt(0)}
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ width: '100%', flex: 1, p: 2.5 }}>
          <Stack spacing={1.25} sx={{ height: '100%' }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 0.5 }}
                  noWrap
                  title={product.name}
                >
                  {product.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{
                    display: 'block',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                  }}
                >
                  {product.slug}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  color: theme.tokens.colors.money,
                  flexShrink: 0,
                }}
              >
                {formatPrice(product.price, product.currency)}
              </Typography>
            </Stack>

            {product.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {product.description}
              </Typography>
            )}

            <Box
              className="pc-cta"
              sx={{
                opacity: 0,
                transform: 'translateX(-6px)',
                transition: 'opacity .2s ease, transform .2s ease',
                color: theme.tokens.colors.primary,
                fontSize: '0.85rem',
                fontWeight: 600,
                mt: 'auto',
              }}
            >
              View product →
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
