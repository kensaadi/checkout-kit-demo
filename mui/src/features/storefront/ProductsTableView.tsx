import {
  Avatar,
  Box,
  Card,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@api/products/products.types';
import { formatPrice } from '../cart/format';

/**
 * Compact list view of the storefront catalog. One row per
 * product with a thumbnail, name, slug, description preview,
 * and the price in the money accent color.
 *
 * Used as an alternative to `ProductCard` grid when the user
 * toggles "Table" in the storefront header. State + persistence
 * live on `ProductsListPage`.
 */
export function ProductsTableView({ products }: { products: Product[] }) {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Card sx={{ p: 0, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>Product</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                Slug
              </TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                hover
                onClick={() => navigate(`/shop/${product.slug}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ width: 72, pr: 0 }}>
                  <Avatar
                    variant="rounded"
                    src={product.coverUrl ?? undefined}
                    alt=""
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: theme.tokens.radius.md + 'px',
                      bgcolor: theme.tokens.colors.surfaceMuted,
                      color: theme.tokens.colors.primary,
                      fontWeight: 700,
                      fontSize: '1.25rem',
                    }}
                  >
                    {product.name.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                      noWrap
                    >
                      {product.name}
                    </Typography>
                    {product.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 460,
                        }}
                      >
                        {product.description}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    display: { xs: 'none', md: 'table-cell' },
                  }}
                >
                  {product.slug}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 800,
                    color: theme.tokens.colors.money,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatPrice(product.price, product.currency)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/shop/${product.slug}`);
                    }}
                    sx={{ color: theme.tokens.colors.textMuted }}
                  >
                    <KeyboardArrowRightIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ height: 4 }} />
    </Card>
  );
}
