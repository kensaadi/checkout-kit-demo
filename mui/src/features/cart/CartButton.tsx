import { Badge, IconButton, Tooltip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@shared/store/cart.store';

/**
 * Topbar cart shortcut for customer users. Renders an icon with a
 * badge showing the total item count (sum of all line quantities).
 *
 * The count is reactive — every cart mutation across the app
 * (add, update, remove, clear) flows through cart.store and the
 * badge re-renders in lock step.
 *
 * Mounted in `TopBar` ONLY when the signed-in user has the
 * `customer` role. The visibility check lives there (role-based
 * UI surface decision), not here.
 */
export function CartButton() {
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <Tooltip title="Cart">
      <IconButton
        color="inherit"
        onClick={() => navigate('/cart')}
        aria-label={`Cart with ${count} item${count === 1 ? '' : 's'}`}
      >
        <Badge badgeContent={count} color="primary" overlap="circular">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
