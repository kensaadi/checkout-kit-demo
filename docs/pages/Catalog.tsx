import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function Catalog() {
  const { fe } = useDocs();
  if (fe === 'tailwind') {
    return (
      <>
        <PageTitle
          eyebrow="Storefront"
          title="Catalog"
          description="The public storefront — paginated grid OR compact table, hero banner, product detail with gallery and related products. 1:1 port of the MUI flavor."
        />

        <H2>Two view modes, one toggle</H2>
        <P>
          The Tailwind storefront is a 1:1 port of the MUI flavor.
          Card grid (default) and compact table are both available, with
          the visitor's preference persisted in localStorage. Two icon
          buttons in the header strip drive which renderer mounts.
        </P>
        <CodeBlock
          filename="client/tailwind/src/features/storefront/ProductsListPage.tsx"
          language="tsx"
          code={`const VIEW_KEY = 'checkout-kit:shopView';
type ShopView = 'card' | 'table';

function loadInitialView(): ShopView {
  if (typeof window === 'undefined') return 'card';
  return window.localStorage.getItem(VIEW_KEY) === 'table' ? 'table' : 'card';
}

const [view, setView] = useState<ShopView>(() => loadInitialView());

function setViewPersisted(next: ShopView) {
  setView(next);
  try { window.localStorage.setItem(VIEW_KEY, next); }
  catch { /* private mode — drop */ }
}`}
        />

        <H2>Hero banner</H2>
        <P>
          A full-width gradient banner (<code>bg-hero-gradient</code> from
          DashForge Tailwind tokens) sits above the grid. Two radial
          highlights give the surface depth without a texture image.
          The banner includes a demo <code>Chip</code> and a short
          value-prop line so the storefront doesn't feel like a blank
          placeholder.
        </P>

        <H2>Skeleton tuned per view</H2>
        <P>
          Loading state renders a skeleton that matches the active view:
          a 3-column grid of rectangle skeletons for card view, a single
          tall rectangle for table view. The skeleton avoids layout shift
          when the real data arrives.
        </P>

        <H2>Active-only public visibility</H2>
        <P>
          The BE serves only <code>active=true</code> products on the
          public endpoint. Draft products are visible to admin via{' '}
          <code>/admin/products</code> but 404 on the public route.
          The same 404 is returned for non-existent slugs — no info disclosure.
        </P>

        <H2>Product detail</H2>
        <P>
          Two-column hero: cover image on the left, price + perks + AddToCart
          on the right. A thumbnail gallery below the cover lets the buyer
          cycle through gallery images. Below the fold: 3 related products
          from the same catalog endpoint with the current product excluded.
        </P>
        <CodeBlock
          filename="client/tailwind/src/features/storefront/ProductDetailPage.tsx"
          language="tsx"
          code={`Promise.all([
  get_product_by_slug(slug),
  list_products({ page: 1, perPage: 8 }),  // for related
]).then(([productR, listR]) => {
  setProduct(productR.data);
  setRelated(
    listR.data.data
      .filter((p) => p.slug !== slug)
      .slice(0, 3),
  );
});`}
        />

        <Callout variant="tip" title="Sticky add-to-cart on mobile">
          On viewports below <code>md</code> a fixed bottom bar
          (<code>fixed inset-x-0 bottom-0 md:hidden</code>) shows the
          product name + price + AddToCart button, so the buyer can pull
          the trigger without scrolling back up to the hero.
        </Callout>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Storefront"
        title="Catalog"
        description="The public storefront — paginated grid OR compact table, hero banner, product detail with related products."
      />

      <H2>Two view modes, one toggle</H2>
      <P>
        The storefront persists the visitor's preferred layout in
        localStorage. Card grid for browsing, compact table for
        catalog-as-spreadsheet. The toggle in the header drives
        which renderer mounts.
      </P>
      <CodeBlock
        filename="client/mui/src/features/storefront/ProductsListPage.tsx"
        language="tsx"
        code={`const VIEW_KEY = 'checkout-kit:shopView';
type ShopView = 'card' | 'table';

function loadInitialView(): ShopView {
  return window.localStorage.getItem(VIEW_KEY) === 'table' ? 'table' : 'card';
}

const [view, setView] = useState<ShopView>(() => loadInitialView());

function handleViewChange(_e, next: ShopView | null) {
  if (!next) return;
  setView(next);
  window.localStorage.setItem(VIEW_KEY, next);
}`}
      />

      <H2>Product card</H2>
      <P>
        Hover lifts the card, scales the cover image, and fades in a{' '}
        <code>"View product →"</code> affordance. The price uses the
        money accent — the same color is used across the kit to mark
        prices, totals, and revenue numbers.
      </P>

      <H2>Active-only public visibility</H2>
      <P>
        The BE serves only{' '}<code>active=true</code> products on the
        public endpoint. Draft products (a buyer typing them up before
        publish) are visible to admin via <code>/admin/products</code>{' '}
        but 404 on the public route. No info disclosure: the same 404
        is returned for non-existent slugs.
      </P>

      <H2>Product detail</H2>
      <P>
        Hero with cover + gallery thumbnails (active highlight on the
        selected one), price in money accent, perk bullets, AddToCart
        with quantity stepper. Below the fold: 3 related products
        pulled from the same catalog endpoint, current product excluded.
      </P>
      <CodeBlock
        filename="ProductDetailPage hydration"
        language="tsx"
        code={`Promise.all([
  get_product_by_slug(slug),
  list_products({ page: 1, perPage: 8 }),  // related
]).then(([productR, listR]) => {
  setProduct(productR.data);
  setRelated(
    listR.data.data
      .filter((p) => p.slug !== slug)
      .slice(0, 3),
  );
});`}
      />

      <Callout variant="tip" title="Sticky add-to-cart on mobile">
        On xs/sm viewports a fixed bottom bar shows the product name +
        price + the AddToCart button, so the buyer can pull the trigger
        without scrolling back up.
      </Callout>
    </>
  );
}
