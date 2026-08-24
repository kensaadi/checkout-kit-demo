import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '@dashforge/ui';
import { admin_delete_product } from '@api/products/products.service';
import type { Product } from '@api/products/products.types';
import { useCall } from '@shared/hooks/useCall';

/**
 * Confirm-and-delete dialog. Two-step UX so a misclick on the
 * "Delete" button in a table row doesn't wipe a product.
 *
 * Visibility is controlled by the parent (`open` prop); rendering
 * the dialog component is unconditional but the underlying MUI
 * Dialog is offscreen when `open` is false. The parent gates the
 * button that flips `open` via `<Can resource="products" action="delete">`.
 */
export function DeleteProductDialog({
  open,
  onClose,
  product,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  product: Product;
  onDeleted?: () => void;
}) {
  const navigate = useNavigate();
  const { success } = useSnackbar();

  const { call: callDelete, loading } = useCall(admin_delete_product, {
    onSuccess: () => {
      success(`"${product.name}" deleted`);
      onClose();
      if (onDeleted) onDeleted();
      else navigate('/admin/products');
    },
  });

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs">
      <DialogTitle>Delete this product?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          You're about to delete <strong>{product.name}</strong>
          {' '}(<code>{product.slug}</code>).
        </DialogContentText>
        <Alert severity="warning" variant="outlined">
          Existing orders that include this product keep their
          snapshot — they won't be affected. New carts will no
          longer be able to add this item.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          loading={loading}
          onClick={() => callDelete(product.id)}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
