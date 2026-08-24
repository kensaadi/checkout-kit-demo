import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function CartOrders() {
  const { fe } = useDocs();
  if (fe === 'tailwind') {
    return (
      <>
        <PageTitle
          eyebrow="Storefront"
          title="Cart & Orders"
          description="One cart per customer. Currency-locked. Live-priced on view. Orders are immutable snapshots at checkout. 1:1 port of the MUI flavor."
        />

        <H2>One cart per customer</H2>
        <P>
          Unique index on <code>customerId</code> in the Mongo{' '}
          <code>carts</code> collection. The service uses
          upsert-by-customerId so callers never have to handle "do they
          already have a cart?". The first <code>GET /v1/cart</code> for
          a new customer creates an empty cart transparently.
        </P>
        <P>
          The cart state is held in a shared Valtio store (
          <code>cart.store.ts</code>) so the TopBar badge and the cart
          page stay in sync without prop drilling — every quantity bump
          or removal hits the BE and refreshes the store atomically.
        </P>

        <H2>Currency lock</H2>
        <P>
          Adding a product whose currency differs from items already in
          the cart returns a 422 with code{' '}
          <code>cart currency mismatch</code>. The CartPage surfaces this
          as an inline error. Single-currency-per-cart is a V1
          simplification — multi-currency requires split-tender checkout
          logic the kit deliberately doesn't ship.
        </P>

        <H2>Live re-pricing at view time</H2>
        <P>
          The cart stores only <code>productId</code> +{' '}
          <code>quantity</code>. Every <code>GET /v1/cart</code> joins
          against the current product state and returns{' '}
          <code>CartItemView</code> with the live price, name, and cover
          image. A customer who added on Monday sees Wednesday's price
          on Wednesday — that's the documented UX.
        </P>
        <CodeBlock
          filename="cart view"
          language="json"
          code={`{
  "id": "...",
  "customerId": "...",
  "currency": "USD",
  "items": [
    {
      "productId": "...",
      "slug": "dashforge-pro-annual",
      "name": "DashForge Pro — Annual",
      "coverUrl": "https://cdn.../...jpg",
      "price": 49900,        // CURRENT catalog price
      "quantity": 1,
      "lineTotal": 49900
    }
  ],
  "itemsTotal": 49900
}`}
        />

        <H2>Order snapshot</H2>
        <P>
          At checkout confirm, the cart items are{' '}
          <strong>copied</strong> into the order with their current
          price, name, and slug. From that moment the order is immutable
          — even a refund only flips the order's status, never rewrites
          items. A customer dispute six months later is answered by the
          snapshot, not the live catalog.
        </P>
        <CodeBlock
          filename="server/internal/model/order.go"
          language="go"
          code={`type OrderItem struct {
  ProductID      bson.ObjectID \`bson:"productId"\`
  Slug           string        \`bson:"slug"\`            // snapshot
  Name           string        \`bson:"name"\`            // snapshot
  PriceCents     int64         \`bson:"priceCents"\`      // snapshot
  Currency       string        \`bson:"currency"\`        // snapshot
  Quantity       int           \`bson:"quantity"\`
  LineTotalCents int64         \`bson:"lineTotalCents"\` // PriceCents * Quantity
}`}
        />

        <H2>Read scope</H2>
        <P>
          <code>GET /v1/orders</code> is customer-scoped (lists only the
          signed-in customer's orders). <code>GET /v1/admin/orders</code>{' '}
          is unrestricted but read-only. A customer asking for someone
          else's order id gets a 404 — never a 403 — to avoid leaking
          whether the id exists.
        </P>

        <Callout variant="tip" title="No order mutation endpoints">
          Orders mutate only via the Stripe webhook on the BE. A refund
          is issued in the Stripe Dashboard; the webhook delivers{' '}
          <code>charge.refunded</code> and the BE flips status to{' '}
          <code>refunded</code>. No human click can mutate an order
          directly — preserves auditability.
        </Callout>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Storefront"
        title="Cart & Orders"
        description="One cart per customer. Currency-locked. Live-priced on view. Orders are immutable snapshots at checkout."
      />

      <H2>One cart per customer</H2>
      <P>
        Unique index on <code>customerId</code> in the Mongo{' '}
        <code>carts</code> collection. The service uses upsert-by-customerId
        so callers never have to handle "do they already have a cart?".
        The first <code>GET /v1/cart</code> for a new customer creates
        an empty cart transparently.
      </P>

      <H2>Currency lock</H2>
      <P>
        Adding a product whose currency differs from items already in
        the cart returns a 422 with code{' '}
        <code>cart currency mismatch</code>. Single-currency-per-cart is
        a V1 simplification — multi-currency requires split-tender
        checkout logic the kit deliberately doesn't ship.
      </P>

      <H2>Live re-pricing at view time</H2>
      <P>
        The cart stores only{' '}<code>productId</code> + <code>quantity</code>.
        Every <code>GET /v1/cart</code> joins against the current product
        state and returns{' '}<code>CartItemView</code>{' '}with the live
        price, name, and cover image. A customer who added on Monday
        sees Wednesday's price on Wednesday — that's the documented UX.
      </P>
      <CodeBlock
        filename="cart view"
        language="json"
        code={`{
  "id": "...",
  "customerId": "...",
  "currency": "USD",
  "items": [
    {
      "productId": "...",
      "slug": "dashforge-pro-annual",
      "name": "DashForge Pro — Annual",
      "coverUrl": "https://cdn.../...jpg",
      "price": 49900,        // CURRENT catalog price
      "quantity": 1,
      "lineTotal": 49900
    }
  ],
  "itemsTotal": 49900
}`}
      />

      <H2>Order snapshot</H2>
      <P>
        At checkout confirm, the cart items are{' '}<strong>copied</strong>{' '}
        into the order with their current price, name, slug. From that
        moment the order is immutable — even a refund only flips the
        order's status, never rewrites items. A customer dispute six
        months later is answered by the snapshot, not the live catalog.
      </P>
      <CodeBlock
        filename="server/internal/model/order.go"
        language="go"
        code={`type OrderItem struct {
  ProductID      bson.ObjectID \`bson:"productId"\`
  Slug           string        \`bson:"slug"\`            // snapshot
  Name           string        \`bson:"name"\`            // snapshot
  PriceCents     int64         \`bson:"priceCents"\`      // snapshot
  Currency       string        \`bson:"currency"\`        // snapshot
  Quantity       int           \`bson:"quantity"\`
  LineTotalCents int64         \`bson:"lineTotalCents"\` // PriceCents * Quantity
}`}
      />

      <H2>Read scope</H2>
      <P>
        <code>GET /v1/orders</code> is customer-scoped (lists only the
        signed-in customer's orders). <code>GET /v1/admin/orders</code>{' '}
        is unrestricted but reading-only. A customer asking for someone
        else's order id gets a 404 — never a 403 — to avoid leaking
        whether the id exists.
      </P>

      <Callout variant="tip" title="No order mutation endpoints">
        Orders mutate only via the Stripe webhook on the BE. A refund
        is issued in the Stripe Dashboard; the webhook delivers{' '}
        <code>charge.refunded</code> and the BE flips status to{' '}
        <code>refunded</code>. No human click can mutate an order
        directly — preserves auditability.
      </Callout>
    </>
  );
}
