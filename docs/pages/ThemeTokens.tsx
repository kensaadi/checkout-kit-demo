import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function ThemeTokens() {
  const { fe } = useDocs();
  if (fe === 'tailwind') {
    return (
      <>
        <PageTitle
          eyebrow="Architecture"
          title="Theme & Tokens"
          description="CSS variables for Tailwind utility classes, a JS token file for non-class consumers (recharts, Stripe, inline style). To rebrand the kit, edit the tokens — classes update automatically."
        />

        <H2>Two layers, one source of truth</H2>
        <P>
          The Tailwind flavor separates theming into two layers that
          share the same brand values:
        </P>
        <P>
          <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
            <li>
              <strong>CSS variables</strong> — declared in{' '}
              <code>src/index.css</code> under <code>:root</code> and{' '}
              <code>.dark</code>. DashForge Tailwind maps these to
              utility classes (<code>bg-primary-600</code>,{' '}
              <code>text-money</code>, <code>bg-money/20</code>, …).
              This is what 95 % of components use.
            </li>
            <li>
              <strong>JS tokens</strong> — <code>kitTokens.ts</code>{' '}
              exports <code>kitTokensLight</code> and{' '}
              <code>kitTokensDark</code> as plain JS objects with the
              same hex/rgb values. Used only where a raw color string is
              required: recharts, Stripe <code>CardElement</code>, and
              inline <code>style={'{{}}'}</code> attributes.
            </li>
          </ul>
        </P>

        <H2>CSS variables (index.css)</H2>
        <P>
          Kit-specific vars use the <code>--kit-*</code> prefix and are
          declared on top of DashForge's <code>--df-tw-*</code> core
          palette. Colors that need Tailwind's{' '}
          <code>{'<alpha-value>'}
          </code>{' '}support are stored as RGB triplets so{' '}
          <code>bg-money/20</code> works out of the box.
        </P>
        <CodeBlock
          filename="client/tailwind/src/index.css (excerpt)"
          language="css"
          code={`:root {
  --kit-money:             5 150 105;   /* RGB triplet → bg-money/20 works */
  --kit-money-soft:       209 250 229;
  --kit-accent:           245 158 11;
  --kit-accent-soft:      254 243 199;
  --kit-shadow-glow:      0 0 0 4px rgba(37, 99, 235, 0.12);
  --kit-gradient-hero:    linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
  --kit-gradient-hero-soft: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
}

.dark {
  --kit-money:             16 185 129;
  --kit-money-soft:         6 78 59;
  --kit-accent:           251 191 36;
  --kit-shadow-glow:      0 0 0 4px rgba(96, 165, 250, 0.18);
  --kit-gradient-hero:    linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%);
}`}
        />

        <H2>JS token file (kitTokens.ts)</H2>
        <P>
          <code>kitTokens.ts</code> mirrors the MUI flavor's{' '}
          <code>tokens.ts</code> exactly — same keys, same values — so
          recharts charts and the Stripe <code>CardElement</code> look
          identical across both flavors.
        </P>
        <CodeBlock
          filename="client/tailwind/src/theme/kitTokens.ts (excerpt)"
          language="typescript"
          code={`export const kitTokensLight = {
  mode: 'light' as const,
  colors: {
    primary:    '#2563EB',
    primaryHover: '#1D4ED8',
    primarySoft:  '#DBEAFE',
    money:      '#059669',     // prices, totals, success states
    danger:     '#DC2626',
    backgroundDefault: '#F9FAFB',
    surface:    '#FFFFFF',
    textPrimary: '#111827',
    // ...full set in the file
  },
  radius:   { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 },
  shadow:   { sm: '...', md: '...', lg: '...', glow: '...' },
  gradients: {
    hero:     'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
    heroSoft: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)',
  },
};

export const kitTokensDark: KitTokens = { /* same shape, dark values */ };`}
        />

        <H2>useKitTokens hook</H2>
        <P>
          Components that need a raw color value (not a class) call{' '}
          <code>useKitTokens()</code>, which tracks the shared
          theme-mode store and returns the correct token set:
        </P>
        <CodeBlock
          filename="client/tailwind/src/theme/useKitTokens.ts"
          language="typescript"
          code={`export function useKitTokens(): KitTokens {
  const { isDark } = useThemeMode();
  return isDark ? kitTokensDark : kitTokensLight;
}

// Usage — recharts AdminDashboard:
const t = useKitTokens();
<stop offset="0%" stopColor={t.colors.money} stopOpacity={0.35} />
<CartesianGrid stroke={t.colors.borderSubtle} />

// Usage — Stripe CardElement:
options={{ style: { base: { color: t.colors.textPrimary } } }}`}
        />

        <H2>Mode store</H2>
        <P>
          The same Valtio store used by the MUI flavor drives the active
          mode. The <code>ThemeModeToggle</code> in the TopBar writes to
          it; the choice persists in localStorage.
        </P>
        <CodeBlock
          filename="client/shared/store/themeMode.store.ts"
          language="typescript"
          code={`export const themeModeStore = proxy<{ mode: ThemeMode }>({ mode: 'light' });

export function useThemeMode() {
  const { mode } = useSnapshot(themeModeStore);
  return {
    mode,
    isDark: mode === 'dark',
    toggle: () => { themeModeStore.mode = mode === 'dark' ? 'light' : 'dark'; },
  };
}

persistStore(themeModeStore, 'themeMode', ['mode'] as const);`}
        />

        <Callout variant="tip" title="Rebrand in 2 places">
          To rebrand the Tailwind flavor update{' '}
          <code>--kit-*</code> vars in <code>index.css</code> (utility
          classes) and the matching hex values in{' '}
          <code>kitTokens.ts</code> (JS consumers). Everything else
          inherits automatically — no component code to touch.
        </Callout>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Architecture"
        title="Theme & Tokens"
        description="One token file, two themes (light + dark), one factory. To rebrand the kit, edit tokens, not the theme."
      />

      <H2>Token shape</H2>
      <P>
        <code>tokens.ts</code> exports <code>lightTokens</code> and{' '}
        <code>darkTokens</code> with the same structure. Every component
        reads <code>theme.tokens.colors.X</code> via a small MUI module
        augmentation and gets the right value for the active mode.
      </P>
      <CodeBlock
        filename="client/mui/src/theme/tokens.ts"
        language="typescript"
        code={`export const lightTokens = {
  mode: 'light' as const,
  colors: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primarySoft: '#DBEAFE',

    secondary: '#4F46E5',
    money: '#059669',       // accent for prices, totals
    accent: '#F59E0B',

    success: '#15803D', warning: '#B45309',
    danger: '#DC2626',  info: '#0EA5E9',

    backgroundDefault: '#F9FAFB',
    surface: '#FFFFFF',
    textPrimary: '#111827',
    // ...
  },
  radius:   { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 },
  shadow:   { sm: '...', md: '...', lg: '...' },
  gradients: {
    hero:     'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
    heroSoft: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)',
  },
};`}
      />

      <H2>Theme factory</H2>
      <CodeBlock
        filename="client/mui/src/theme/theme.ts"
        language="typescript"
        code={`function makeTheme(t: KitTokens): Theme {
  return createTheme({
    tokens: t,
    palette: {
      mode: t.mode,
      primary:   { main: t.colors.primary, light: t.colors.primarySoft },
      success:   { main: t.colors.success, light: t.colors.successSoft },
      background:{ default: t.colors.backgroundDefault, paper: t.colors.surface },
      // ...
    },
    components: {
      MuiCard:   { /* radius lg, subtle border, soft shadow */ },
      MuiButton: { /* lift on hover, no MUI default elevation */ },
      MuiAppBar: { /* blurred translucent surface */ },
      // ...
    },
  });
}

export const lightTheme = makeTheme(lightTokens);
export const darkTheme  = makeTheme(darkTokens);`}
      />

      <H2>Mode store</H2>
      <P>
        A Valtio store + a TopBar toggle drive the active theme. The
        choice persists in localStorage so the visitor's pick survives
        reloads.
      </P>
      <CodeBlock
        filename="client/shared/store/themeMode.store.ts"
        language="typescript"
        code={`export const themeModeStore = proxy<{ mode: ThemeMode }>({ mode: 'light' });

export function useThemeMode() {
  const snap = useSnapshot(themeModeStore) as typeof themeModeStore;
  return {
    mode: snap.mode,
    isDark: snap.mode === 'dark',
    toggle: () => {
      themeModeStore.mode = snap.mode === 'dark' ? 'light' : 'dark';
    },
  };
}

persistStore(themeModeStore, 'themeMode', ['mode'] as const);`}
      />

      <Callout variant="tip" title="Rebrand in 1 file">
        Forking buyers usually rebrand the kit by editing only{' '}
        <code>tokens.ts</code>. The factory + component overrides stay
        untouched, and the change cascades into every page in light AND
        dark mode.
      </Callout>
    </>
  );
}
