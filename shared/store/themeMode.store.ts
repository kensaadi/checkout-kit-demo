import { proxy, useSnapshot } from 'valtio';
import { persistStore } from './persist';

/**
 * Current theme mode, persisted across reloads so the user's
 * preference sticks.
 *
 * Default: 'light'. We could detect `prefers-color-scheme` and
 * default to it, but doing so makes the demo feel like it's
 * "deciding for me" — explicit toggle in the topbar is the
 * clearer affordance for a kit demo.
 */
export type ThemeMode = 'light' | 'dark';

export const themeModeStore = proxy<{ mode: ThemeMode }>({
  mode: 'light',
});

export function useThemeMode() {
  const snap = useSnapshot(themeModeStore) as typeof themeModeStore;
  return {
    mode: snap.mode,
    isDark: snap.mode === 'dark',
    toggle: () => {
      themeModeStore.mode = snap.mode === 'dark' ? 'light' : 'dark';
    },
    setMode: (m: ThemeMode) => {
      themeModeStore.mode = m;
    },
  };
}

persistStore(themeModeStore, 'themeMode', ['mode'] as const);
