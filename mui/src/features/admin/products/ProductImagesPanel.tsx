import { useRef, useState } from 'react';
import {
  Box,
  Card,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import { Can } from '@dashforge/rbac';
import DeleteIcon from '@mui/icons-material/DeleteOutlineRounded';
import UploadIcon from '@mui/icons-material/CloudUploadRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useSnackbar } from '@dashforge/ui';
import {
  admin_add_gallery_image,
  admin_clear_cover,
  admin_remove_gallery_image,
  admin_upload_cover,
} from '@api/products/products.service';
import type { Product } from '@api/products/products.types';
import { useCall } from '@shared/hooks/useCall';

/**
 * Cover + gallery management for a single product. Shown only on
 * the edit page (a product must exist before it has images).
 *
 * Drag-drop is enabled on both the cover slot and the gallery
 * grid: drop a file → upload. Click-to-pick fallback for users
 * who don't want to drag.
 *
 * Every mutation returns the updated Product; the parent passes
 * `onProductUpdated` so the page syncs local state without a GET
 * round-trip.
 *
 * Each action is independently gated by `<Can>` on `products:update`
 * so a sales user viewing this panel sees only previews — never
 * the upload / remove buttons or the drop overlay.
 */
export function ProductImagesPanel({
  product,
  onProductUpdated,
}: {
  product: Product;
  onProductUpdated: (updated: Product) => void;
}) {
  const theme = useTheme();
  const { success, error: notifyError } = useSnackbar();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const [galleryDragOver, setGalleryDragOver] = useState(false);

  const { call: callUploadCover, loading: uploadingCover } = useCall(
    admin_upload_cover,
    {
      onSuccess: (p) => {
        onProductUpdated(p);
        success('Cover image uploaded');
      },
    },
  );
  const { call: callClearCover, loading: clearingCover } = useCall(
    admin_clear_cover,
    {
      onSuccess: (p) => {
        onProductUpdated(p);
        success('Cover image removed');
      },
    },
  );
  const { call: callAddGallery, loading: addingGallery } = useCall(
    admin_add_gallery_image,
    {
      onSuccess: (p) => {
        onProductUpdated(p);
        success('Gallery image added');
      },
    },
  );
  const { call: callRemoveGallery, loading: removingGallery } = useCall(
    admin_remove_gallery_image,
    {
      onSuccess: (p) => {
        onProductUpdated(p);
        success('Gallery image removed');
      },
    },
  );

  const busy =
    uploadingCover || clearingCover || addingGallery || removingGallery;

  function handleCoverPick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notifyError('Only image files are accepted');
      return;
    }
    callUploadCover(product.id, file);
  }

  function handleGalleryPick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notifyError('Only image files are accepted');
      return;
    }
    callAddGallery(product.id, file);
  }

  return (
    <Stack spacing={2.5}>
      {/* === Cover === */}
      <Card sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Cover image
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Shown on the product card and as the main image on the
              detail page.
            </Typography>
          </Box>

          <Box
            onDragOver={(e) => {
              e.preventDefault();
              if (!busy) setCoverDragOver(true);
            }}
            onDragLeave={() => setCoverDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setCoverDragOver(false);
              if (busy) return;
              handleCoverPick(e.dataTransfer.files?.[0]);
            }}
            sx={{
              position: 'relative',
              aspectRatio: '4 / 3',
              borderRadius: theme.tokens.radius.md + 'px',
              overflow: 'hidden',
              border: '2px dashed',
              borderColor: coverDragOver
                ? theme.tokens.colors.primary
                : product.coverUrl
                  ? 'transparent'
                  : theme.tokens.colors.borderDefault,
              bgcolor: product.coverUrl
                ? 'transparent'
                : theme.tokens.colors.surfaceMuted,
              transition: 'border-color .2s ease, background-color .2s ease',
            }}
          >
            {product.coverUrl ? (
              <Box
                component="img"
                src={product.coverUrl}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <Stack
                spacing={1}
                sx={{
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 2,
                  textAlign: 'center',
                }}
              >
                <ImageOutlinedIcon
                  sx={{
                    fontSize: 36,
                    color: theme.tokens.colors.textMuted,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Drag an image here, or use the button below
                </Typography>
              </Stack>
            )}
            {coverDragOver && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(37,99,235,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.tokens.colors.primary,
                    fontWeight: 700,
                    bgcolor: 'background.paper',
                    px: 2,
                    py: 1,
                    borderRadius: theme.tokens.radius.pill + 'px',
                    boxShadow: theme.tokens.shadow.md,
                  }}
                >
                  Drop to upload
                </Typography>
              </Box>
            )}
          </Box>

          <Can action="update" resource="products" fallback={null}>
            <Stack direction="row" spacing={1}>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  handleCoverPick(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                loading={uploadingCover}
                disabled={busy && !uploadingCover}
                onClick={() => coverInputRef.current?.click()}
                sx={{ flex: 1 }}
              >
                {product.coverUrl ? 'Replace' : 'Upload'}
              </Button>
              {product.coverUrl && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  loading={clearingCover}
                  disabled={busy && !clearingCover}
                  onClick={() => callClearCover(product.id)}
                >
                  Remove
                </Button>
              )}
            </Stack>
          </Can>
        </Stack>
      </Card>

      {/* === Gallery === */}
      <Card sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Gallery ({product.galleryUrls?.length ?? 0})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Extra images shown below the cover on the detail page.
            </Typography>
          </Box>

          <Box
            onDragOver={(e) => {
              e.preventDefault();
              if (!busy) setGalleryDragOver(true);
            }}
            onDragLeave={() => setGalleryDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setGalleryDragOver(false);
              if (busy) return;
              handleGalleryPick(e.dataTransfer.files?.[0]);
            }}
            sx={{
              position: 'relative',
              borderRadius: theme.tokens.radius.md + 'px',
              border: '2px dashed',
              borderColor: galleryDragOver
                ? theme.tokens.colors.primary
                : theme.tokens.colors.borderSubtle,
              bgcolor: galleryDragOver
                ? 'rgba(37,99,235,0.04)'
                : 'transparent',
              p: 1,
              transition: 'border-color .2s ease, background-color .2s ease',
              minHeight: 100,
            }}
          >
            {(product.galleryUrls?.length ?? 0) === 0 ? (
              <Stack
                spacing={0.5}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 2,
                }}
              >
                <Typography variant="body2" color="text.disabled">
                  No gallery images yet
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Drag here, or use the button below
                </Typography>
              </Stack>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: 'repeat(3, 1fr)',
                }}
              >
                {(product.galleryUrls ?? []).map((url) => (
                  <Box
                    key={url}
                    sx={{
                      position: 'relative',
                      aspectRatio: '1 / 1',
                      borderRadius: theme.tokens.radius.sm + 'px',
                      overflow: 'hidden',
                      border: `1px solid ${theme.tokens.colors.borderSubtle}`,
                    }}
                  >
                    <Box
                      component="img"
                      src={url}
                      alt=""
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <Can
                      action="update"
                      resource="products"
                      fallback={null}
                    >
                      <IconButton
                        size="small"
                        onClick={() => callRemoveGallery(product.id, url)}
                        disabled={busy}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255,255,255,0.92)',
                          color: theme.tokens.colors.danger,
                          width: 24,
                          height: 24,
                          '&:hover': { bgcolor: 'background.paper' },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Can>
                  </Box>
                ))}
              </Box>
            )}
            {galleryDragOver && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.tokens.colors.primary,
                    fontWeight: 700,
                    bgcolor: 'background.paper',
                    px: 2,
                    py: 1,
                    borderRadius: theme.tokens.radius.pill + 'px',
                    boxShadow: theme.tokens.shadow.md,
                  }}
                >
                  Drop to append
                </Typography>
              </Box>
            )}
          </Box>

          <Can action="update" resource="products" fallback={null}>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                handleGalleryPick(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              loading={addingGallery}
              disabled={busy && !addingGallery}
              onClick={() => galleryInputRef.current?.click()}
              fullWidth
            >
              Add gallery image
            </Button>
          </Can>
        </Stack>
      </Card>
    </Stack>
  );
}
