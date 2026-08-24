import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function ProviderPattern() {
  const { fe } = useDocs();
  if (fe === 'tailwind') {
    return (
      <>
        <PageTitle
          eyebrow="Architecture"
          title="Provider Pattern"
          description="client/api/ is 100% shared between MUI and Tailwind. The only Tailwind-specific wiring is AppProviders — no MUI theme object, simpler provider tree, SnackbarBridge for the form pipeline."
        />

        <H2>Shared API layer — nothing changes</H2>
        <P>
          Everything under <code>client/api/</code> is identical in both
          flavors. The domain anatomy, provider interfaces, lazy loaders,
          mappers, live/mock implementations, and zod schemas are the same
          files imported by both <code>client/mui</code> and{' '}
          <code>client/tailwind</code>. If you add a new domain or fix a
          mapper, one change covers both flavors.
        </P>
        <CodeBlock
          language="bash"
          filename="client/api/cart/"
          code={`cart/
├── cart.types.ts            # zod schemas + TS types (FE shape)
├── cart.provider.ts         # CartProvider interface + lazy loader
├── cart.service.ts          # public functions consumed by features
├── live/
│   ├── cart.live.ts         # axios → BE, parses with responseSchema
│   ├── cart.live.types.ts   # BE wire shape (NOT FE shape)
│   ├── cart.live.mapper.ts  # BE → FE shape
│   └── cart.live.test.ts
└── mock/
    ├── cart.mock.ts         # in-memory state + delays
    ├── cart.mock.data.ts
    └── cart.mock.test.ts`}
        />

        <H2>AppProviders — simpler tree</H2>
        <P>
          The MUI flavor wraps the app in a dual{' '}
          <code>ThemeProvider</code> layer (light + dark theme objects).
          The Tailwind flavor replaces that with{' '}
          <code>DashforgeTailwindProvider</code> — a single wrapper that
          injects the <code>--df-tw-*</code> CSS vars on{' '}
          <code>{'<html>'}</code> and sets the{' '}
          <code>data-dash-tw-theme</code> attribute. No theme object to
          graft at runtime.
        </P>
        <CodeBlock
          filename="client/tailwind/src/app/AppProviders.tsx"
          language="tsx"
          code={`export function AppProviders({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode(); // shared themeMode.store.ts

  useEffect(() => {
    setMode(mode); // keeps @dashforge/tw-theme in sync
  }, [mode]);

  return (
    <DashforgeTailwindProvider mode={mode}>
      <SnackbarProvider>
        <SnackbarBridge />          {/* wires form pipeline → TW snackbar */}
        <BrowserRouter>
          <PolicyBootstrap>{children}</PolicyBootstrap>
        </BrowserRouter>
      </SnackbarProvider>
    </DashforgeTailwindProvider>
  );
}`}
        />

        <H2>SnackbarBridge</H2>
        <P>
          The <code>@shared</code> form pipeline (
          <code>useApiSubmit</code>) needs a default error handler but
          can't import from any UI lib — it's shared. The{' '}
          <code>SnackbarBridge</code> component (rendered inside{' '}
          <code>SnackbarProvider</code>) calls{' '}
          <code>setDefaultErrorHandler</code> once on mount, wiring API
          errors to the DashForge TW snackbar without any import coupling.
        </P>
        <CodeBlock
          filename="client/tailwind/src/app/AppProviders.tsx"
          language="tsx"
          code={`function SnackbarBridge(): null {
  const { enqueue } = useSnackbar(); // from '@dashforge/tw'
  useEffect(() => {
    setDefaultErrorHandler((e) => {
      enqueue({ message: e.message, severity: 'danger' });
    });
  }, [enqueue]);
  return null;
}`}
        />

        <H2>PolicyBootstrap — 1:1 port</H2>
        <P>
          <code>PolicyBootstrap</code> is a 1:1 port of the MUI flavor.
          It fetches the RBAC policy on mount, shows{' '}
          <code>{'<SplashScreen />'}</code> while loading, renders an
          inline retry screen on error, then mounts{' '}
          <code>RbacProvider</code> with the user subject pulled from{' '}
          <code>userStore</code>. Login/logout updates RBAC decisions
          reactively — no re-bootstrap needed.
        </P>

        <Callout variant="success" title="CONTRACT_MISMATCH never silently">
          The axios client carries a <code>responseSchema</code> (zod) on
          every request. If the BE drifts (renamed field, dropped key),
          the interceptor throws an <code>ApiError</code> with code{' '}
          <code>CONTRACT_MISMATCH</code> instead of letting a malformed
          shape leak into the app. Both flavors share the same interceptor
          — fix the mapper once, both are covered.
        </Callout>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Architecture"
        title="Provider Pattern"
        description="Every API domain exposes one interface and two implementations: live (axios) and mock (in-memory)."
      />

      <H2>Anatomy of a domain</H2>
      <P>
        Each domain under <code>client/api/&lt;name&gt;/</code> follows
        the same shape. The provider interface is the single contract
        the rest of the kit depends on — components never import the
        live or mock implementations directly.
      </P>
      <CodeBlock
        language="bash"
        filename="client/api/cart/"
        code={`cart/
├── cart.types.ts            # zod schemas + TS types (FE shape)
├── cart.provider.ts         # CartProvider interface + lazy loader
├── cart.service.ts          # public functions consumed by features
├── live/
│   ├── cart.live.ts         # axios → BE, parses with responseSchema
│   ├── cart.live.types.ts   # BE wire shape (NOT FE shape)
│   ├── cart.live.mapper.ts  # BE → FE shape
│   └── cart.live.test.ts
└── mock/
    ├── cart.mock.ts         # in-memory state + delays
    ├── cart.mock.data.ts
    └── cart.mock.test.ts`}
      />

      <H2>The provider loader</H2>
      <P>
        The provider module exposes an interface + a lazy loader
        keyed by{' '}<code>VITE_PROVIDER</code>. Dynamic imports keep
        the mock out of the production bundle.
      </P>
      <CodeBlock
        filename="client/api/cart/cart.provider.ts"
        language="typescript"
        code={`export interface CartProvider {
  getCart(): Promise<CartView>;
  addItem(input: AddItemInput): Promise<CartView>;
  updateItem(productId: string, input: UpdateItemInput): Promise<CartView>;
  removeItem(productId: string): Promise<CartView>;
  clearCart(): Promise<CartView>;
}

const cartProviderMapping = {
  live: () => import('./live/cart.live').then((m) => m.default as CartProvider),
  mock: () => import('./mock/cart.mock').then((m) => m.default as CartProvider),
};

export async function cartProvider(): Promise<CartProvider> {
  const loader = cartProviderMapping[PROVIDER];
  if (!loader) throw new Error(\`[cart] provider "\${PROVIDER}" not supported\`);
  return loader();
}`}
      />

      <H2>Mapper layer</H2>
      <P>
        BE wire shape and FE consumer shape sometimes differ — Go uses
        <code> priceCents </code>nested under <code>media.coverImage</code>;
        the FE prefers a flat <code>price</code> + <code>coverUrl</code>. The
        mapper bridges them so components only ever see the FE shape.
      </P>
      <CodeBlock
        filename="client/api/products/live/products.live.mapper.ts"
        language="typescript"
        code={`export function mapProduct(input: BackendProduct): Product {
  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    description: input.description,
    price: input.priceCents,
    currency: input.currency,
    active: input.active,
    coverUrl: input.media.coverImage ? input.media.coverImage : null,
    galleryUrls: input.media.gallery,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}`}
      />

      <Callout variant="success" title="CONTRACT_MISMATCH never silently">
        The axios client carries a <code>responseSchema</code> (zod) on
        every request. If the BE drifts (renamed field, dropped key),
        the interceptor throws an <code>ApiError</code> with code{' '}
        <code>CONTRACT_MISMATCH</code> instead of letting a malformed
        shape leak into the app. Caught early, fixed in one place — the
        mapper.
      </Callout>
    </>
  );
}
