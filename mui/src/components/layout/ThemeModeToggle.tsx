import { IconButton, Tooltip, useTheme } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useThemeMode } from '@shared/store/themeMode.store';

/**
 * Topbar toggle for light / dark mode. Persists the choice in
 * localStorage via the themeMode store so the preference sticks
 * across reloads and tabs.
 *
 * Animates the icon swap on click — pure CSS rotation, no
 * framer-motion needed.
 */
export function ThemeModeToggle() {
  const { mode, toggle } = useThemeMode();
  const theme = useTheme();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light' : 'Switch to dark'} placement="bottom">
      <IconButton
        onClick={toggle}
        size="small"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        sx={{
          color: theme.tokens.colors.textSecondary,
          width: 36,
          height: 36,
          borderRadius: theme.tokens.radius.pill + 'px',
          transition: 'background-color .2s ease, color .2s ease',
          '&:hover': {
            color: theme.tokens.colors.primary,
            bgcolor: theme.tokens.colors.primarySoft,
          },
          '& svg': {
            transition: 'transform .35s cubic-bezier(.4,1.6,.5,1)',
            transform: isDark ? 'rotate(0deg)' : 'rotate(-30deg)',
          },
        }}
      >
        {isDark ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
