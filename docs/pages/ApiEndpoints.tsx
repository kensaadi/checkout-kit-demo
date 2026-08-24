import { ApiEndpoint } from '../components/ApiEndpoint';
import { Callout } from '../components/Callout';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function ApiEndpoints() {
  const { be } = useDocs();
  const isNode = be === 'node';

  return (
    <>
      <PageTitle
        eyebrow="API Reference"
        title="Endpoints"
        description="33 endpoints under /v1. Public (no auth), staff-area (admin + sales), customer-area, plus the Stripe webhook."
      />

      <Callout variant="info" title="Prefer to run, not read?">
        The kit ships a ready-to-import{' '}
        <strong>Bruno collection</strong> (43 files) covering every
        endpoint listed below with happy-path AND negative cases.
        See the dedicated{' '}<strong>Bruno Collection</strong>{' '}page
        in this section for the setup walkthrough.{isNode && (
          <>
            {' '}Wire contract is identical across editions — same paths,
            methods, payloads, error shape; only the handler runtime
            (Express vs Gin) differs.
          </>
        )}
      </Callout>

      <H2>Public</H2>

      <ApiEndpoint
        method="POST"
        path="/v1/auth/login"
        description="Staff login (admin + sales). Returns { token } or 401 invalid credentials."
        requestExample={`{
  "email": "admin@checkout-kit.local",
  "password": "AdminPass!2026"
}`}
        responseExample={`{
  "token": "eyJhbGciOi..."
}`}
      />

      <ApiEndpoint
        method="POST"
        path="/v1/auth/customer-login"
        description="Customer login. Same shape as staff login; the BE issues a token with roles=['customer']."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/products"
        description="Public catalog list. Active-only, paginated. Drafts return 404 indistinguishable from non-existent."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/products/:slug"
        description="Single product by slug. 404 for missing OR draft slugs (no info disclosure)."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/policies"
        description="RBAC policy document. Public (the FE bootstraps before any user has a token). Returns role definitions, NOT per-subject decisions."
      />

      <ApiEndpoint
        method="POST"
        path="/v1/webhooks/stripe"
        description="Stripe webhook. Public but signature-verified via STRIPE_WEBHOOK_SECRET — three event types handled: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded."
      />

      <H2>Customer area (auth required)</H2>

      <ApiEndpoint
        method="GET"
        path="/v1/customer/me"
        auth
        description="The signed-in customer's profile."
      />

      <ApiEndpoint
        method="PATCH"
        path="/v1/customer/me"
        auth
        description="Update profile (firstName / lastName / phone / avatar). Empty patch returns 400."
      />

      <ApiEndpoint
        method="POST"
        path="/v1/customer/change-password"
        auth
        description="Change password. 422 with details.currentPassword on wrong current; 204 on success."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/cart"
        auth
        description="The customer's cart (enriched: current price, name, cover). Creates an empty one on first call."
      />

      <ApiEndpoint
        method="POST"
        path="/v1/cart/items"
        auth
        description="Add (or merge by sum) a product to the cart. 422 on currency-mismatch / inactive product."
        requestExample={`{
  "productId": "6a2...",
  "quantity": 1
}`}
      />

      <ApiEndpoint
        method="PATCH"
        path="/v1/cart/items/:productId"
        auth
        description="Set ABSOLUTE quantity (not delta) for a cart line. Quantity 0 not allowed (use DELETE)."
      />

      <ApiEndpoint
        method="DELETE"
        path="/v1/cart/items/:productId"
        auth
        description="Remove a line. Idempotent — removing a missing productId returns the unchanged cart, not 404."
      />

      <ApiEndpoint
        method="DELETE"
        path="/v1/cart"
        auth
        description="Clear all lines, keep the cart document. Used post-checkout."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/checkout/payment-methods"
        auth
        description="Customer's saved cards. Empty list (200) for a brand-new customer — lazy Stripe Customer is created on first call."
      />

      <ApiEndpoint
        method="POST"
        path="/v1/checkout/setup-intent"
        auth
        description="Returns clientSecret for stripe.confirmCardSetup — attaches a new card to the customer's Stripe Customer."
      />

      <ApiEndpoint
        method="POST"
        path="/v1/checkout/confirm"
        auth
        description="Pay with a saved card. Creates Order BEFORE PaymentIntent (orderId in PI metadata). Idempotency key = order_<orderID>."
        requestExample={`{
  "paymentMethodId": "pm_..."
}`}
      />

      <ApiEndpoint
        method="GET"
        path="/v1/orders"
        auth
        description="Customer-scoped order list. Paginated, newest first."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/orders/:id"
        auth
        description="One order, scoped to the calling customer. 404 (not 403) when the order belongs to someone else."
      />

      <H2>Staff area (admin + sales, auth required)</H2>

      <ApiEndpoint
        method="GET"
        path="/v1/me"
        auth
        description="The signed-in staff user's profile."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/admin/products"
        auth
        description="Full catalog (drafts visible). Paginated."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/admin/products/:id"
        auth
        description="Any product by ObjectID (drafts included)."
      />

      <ApiEndpoint
        method="POST"
        path="/v1/admin/products"
        auth
        description="Create product. Slug must be unique (409 on dup)."
      />

      <ApiEndpoint
        method="PATCH"
        path="/v1/admin/products/:id"
        auth
        description="Partial update. Empty patch returns 400. Active uses *bool to distinguish absent from explicit-false."
      />

      <ApiEndpoint
        method="DELETE"
        path="/v1/admin/products/:id"
        auth
        description="Hard delete. NOT recursive over S3 — buyer's janitor cleans orphans."
      />

      <ApiEndpoint
        method="POST"
        path="/v1/admin/products/:id/cover"
        auth
        description="Multipart cover image upload. file field. MIME whitelist + 10 MiB cap. Returns updated product with media.coverImage set."
      />

      <ApiEndpoint
        method="DELETE"
        path="/v1/admin/products/:id/cover"
        auth
        description="Clear cover (does NOT delete S3 object — orphan tradeoff documented)."
      />

      <ApiEndpoint
        method="POST"
        path="/v1/admin/products/:id/gallery"
        auth
        description="Append a gallery image. Same multipart contract as cover."
      />

      <ApiEndpoint
        method="DELETE"
        path="/v1/admin/products/:id/gallery"
        auth
        description="Remove one URL from the gallery array (URL in JSON body, NOT query)."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/admin/orders"
        auth
        description="ALL orders across customers. Read-only — no mutation endpoints by design."
      />

      <ApiEndpoint
        method="GET"
        path="/v1/admin/orders/:id"
        auth
        description="Any order by id (no ownership filter)."
      />

      <Callout variant="tip" title="Error shape across the API">
        Every error returns{' '}<code>{`{ "error": "<message>" }`}</code>{' '}
        plus an HTTP status. Validation errors carry an optional{' '}
        <code>details</code> map of field-level messages —{' '}
        <code>useApiSubmit</code> in the FE maps it to RHF field errors
        automatically.
      </Callout>
    </>
  );
}
