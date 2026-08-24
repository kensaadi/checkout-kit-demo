import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function Architecture() {
  const { fe, be } = useDocs();
  const isNode = be === 'node';

  if (fe === 'tailwind') {
    return (
      <>
        <PageTitle
          eyebrow="Architecture"
          title={
            isNode
              ? 'Node.js SaaS Project Structure — Production Layout'
              : 'Go SaaS Project Structure — Production Layout'
          }
          description={
            isNode
              ? 'How to structure a production Node.js SaaS backend with Express, TypeScript, and Mongoose, paired with a React + Tailwind CSS frontend. Real-world layout from a shipped kit — controllers, services, models, middleware, and a clean RBAC + Stripe layer.'
              : 'How to structure a production Go SaaS backend with Gin and MongoDB, paired with a React + Tailwind CSS frontend. cmd/ entry points, internal/ domain layers, pkg/ reusable libraries — real-world layout from a shipped kit.'
          }
        />

        <H2>Why this structure won't fight you at scale</H2>
        <P>
          The Tailwind flavor shares the same API domain layer and state
          stores as the MUI flavor — only the rendering folder differs.
          Both flavors read from the same{' '}<code>client/api/</code>{' '}
          provider pattern and the same{' '}<code>client/shared/</code>{' '}
          utilities, so switching between them is a rendering-layer
          decision, not an architecture one.
        </P>
        <P>
          The Tailwind flavor replaces MUI components with DashForge
          Tailwind primitives and a utility-first approach via Tailwind
          CSS v4. Design tokens live in{' '}<code>src/theme/kitTokens.ts</code>{' '}
          and are consumed through a{' '}<code>useKitTokens()</code>{' '}hook —
          the same token contract as the MUI flavor, different rendering
          layer.
        </P>

        <H2>Top level</H2>
        <CodeBlock
          language="bash"
          filename="checkout-kit/"
          code={`checkout-kit/
├── api/                          # Bruno collection (43 .bru files)
├── client/                       # Frontend monorepo
│   ├── api/                      # SHARED — provider pattern (live + mock)
│   ├── shared/                   # SHARED — stores, forms, RBAC, hooks
│   ├── mui/                      # MUI flavor app
│   └── tailwind/                 # Tailwind flavor app (this)
├── server/                       # ${isNode ? 'Node backend' : 'Go backend'}
${
  isNode
    ? `│   ├── src/api/                  # express server entry
│   ├── src/seed/                 # seed users/products/orders
│   ├── src/controllers/          # express handlers
│   ├── src/services/             # business logic
│   ├── src/models/               # mongoose schemas
│   ├── src/routes/               # route mounting
│   ├── src/middleware/           # RBAC, auth, body limit, ...
│   ├── src/lib/rbac/             # RBAC engine (reusable)
│   ├── src/lib/storage/          # S3 client
│   └── src/seed-data/            # .json fixture files`
    : `│   ├── cmd/api/                  # main: HTTP server
│   ├── cmd/seed/                 # main: seed users/products/orders
│   ├── internal/handler/         # gin handlers
│   ├── internal/service/         # business logic
│   ├── internal/model/           # Mongo schemas
│   ├── internal/route/           # route mounting
│   ├── internal/middleware/      # RBAC, auth, body limit, ...
│   ├── pkg/rbac/                 # RBAC engine (reusable)
│   ├── pkg/storage/              # S3 client
│   └── seed/                     # .json fixture files`
}
└── docs/                         # in-repo design notes`}
        />

        <H2>Frontend layout (Tailwind flavor)</H2>
        <P>
          The Tailwind app shares{' '}<code>client/api/</code>{' '}and{' '}
          <code>client/shared/</code>{' '}with the MUI flavor. Only{' '}
          <code>client/tailwind/src/</code>{' '}is flavor-specific.
        </P>
        <CodeBlock
          language="bash"
          filename="client/"
          code={`client/
├── api/                          # SHARED — provider pattern
│   ├── _shared/                  # axios client, error model, attempt()
│   ├── auth/      live/  mock/   # per-domain: live + mock + types
│   ├── me/        live/  mock/
│   ├── products/  live/  mock/
│   ├── cart/      live/  mock/
│   ├── checkout/  live/  mock/
│   ├── orders/    live/  mock/
│   └── policies/  live/  mock/
├── shared/                       # SHARED — stores, forms, RBAC, hooks
│   ├── store/   (Valtio + persist)
│   ├── forms/   (useApiSubmit + VALIDATION_ERROR auto-map)
│   ├── rbac/    (route guards)
│   └── hooks/   (useCall, ...)
├── mui/                          # MUI flavor (see MUI tab)
└── tailwind/                     # Tailwind flavor (this)
    └── src/
        ├── app/         (AppProviders, AppRouter, PolicyBootstrap)
        ├── components/
        │   ├── layout/  (TopBar, AppShell, BrandMark, ActivityBell, ...)
        │   ├── fields/  (InputField, EmailField, PasswordField)
        │   ├── primitives/ (Avatar, Badge, Card, Menu, Spinner, ...)
        │   ├── demo/    (DemoBanner)
        │   └── illustrations/
        ├── features/    (auth, storefront, cart, checkout, orders, admin)
        └── theme/       (kitTokens.ts + useKitTokens hook)`}
        />

        <H2>Backend layout ({isNode ? 'Node + Express' : 'Go'})</H2>
        {isNode ? (
          <CodeBlock
            language="bash"
            filename="server/"
            code={`server/
├── src/
│   ├── api/
│   │   ├── index.ts          # express entry — middleware + router mount
│   │   └── server.ts         # http.Server start + graceful shutdown
│   ├── seed/index.ts         # idempotent seeding (npm run seed)
│   ├── controllers/          # express handlers (one file per entity)
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── checkout.controller.ts
│   │   ├── order.controller.ts
│   │   └── webhook.controller.ts
│   ├── services/             # domain logic + AppError(code, status)
│   ├── models/               # mongoose schemas (Product, Order, ...)
│   ├── routes/               # router(deps) + per-area RBAC gates
│   ├── middleware/           # requireAuth, requireRole, rbacGate, errorHandler
│   ├── config/               # zod env loader
│   ├── db/                   # mongoose connect + ensureIndexes
│   ├── lib/
│   │   ├── rbac/             # engine (policy → decision)
│   │   └── storage/          # ObjectStore interface + S3 impl
│   └── seed-data/            # .json fixture files
├── tsconfig.json
└── package.json`}
          />
        ) : (
          <CodeBlock
            language="bash"
            filename="server/"
            code={`server/
├── cmd/
│   ├── api/main.go         # HTTP server entry
│   └── seed/main.go        # idempotent seeding
├── internal/
│   ├── handler/            # gin handlers (one file per entity)
│   ├── service/            # domain logic + sentinels (ErrSlugTaken, ...)
│   ├── model/              # Mongo entities with bson + json tags
│   ├── route/              # Mount(r, deps) + per-area RBAC gates
│   ├── middleware/         # RequireAuth, RequireRole, RBACGate
│   ├── config/             # env loader
│   ├── db/                 # Mongo client + EnsureIndexes
│   └── apperr/             # error sentinels
├── pkg/
│   ├── rbac/               # engine (policy → decision)
│   └── storage/            # ObjectStore interface + S3 impl
└── seed/                   # .json fixture files`}
          />
        )}

        <Callout variant="tip" title="Tailwind vs MUI — same API, different rendering">
          Everything in <code>client/api/</code> and{' '}
          <code>client/shared/</code> is identical across both flavors.
          Adding an endpoint or a store automatically benefits both. The
          MUI/Tailwind choice is purely a rendering-layer decision — not
          a data-fetching or state-management one.
        </Callout>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Architecture"
        title={
          isNode
            ? 'Node.js SaaS Project Structure — Production Layout'
            : 'Go SaaS Project Structure — Production Layout'
        }
        description={
          isNode
            ? 'How to structure a production Node.js SaaS backend with Express, TypeScript, and Mongoose (PostgreSQL available free on request), paired with a React frontend. Real-world layout from a shipped kit — controllers, services, models, middleware, and a clean RBAC + Stripe layer.'
            : 'How to structure a production Go SaaS backend with Gin and MongoDB (PostgreSQL available free on request), paired with a React frontend. cmd/ entry points, internal/ domain layers, pkg/ reusable libraries — real-world layout from a shipped kit.'
        }
      />

      <H2>Why this structure won't fight you at scale</H2>
      {isNode ? (
        <P>
          Most Node.js SaaS tutorials show a single{' '}<code>src/index.ts</code>{' '}
          with everything inlined: middleware, routes, business logic,
          DB queries. It runs. It also collapses the moment you grow
          past three resources or need a second entry point (cron job,
          seed script, CLI tool). The Node Edition of the kit follows a
          shape that production teams converge on regardless of
          framework: thin controllers, fat services, models that own
          persistence, middleware as composable functions.
        </P>
      ) : (
        <P>
          Most "Go web service" tutorials show a single{' '}
          <code>main.go</code>{' '}with route handlers, business logic,
          and Mongo queries all in one file. It runs. It also collapses
          the moment you add a seed script (second entry point), a
          cron job, or any service you want to share between them. The
          Go Edition of the kit follows the standard Go project layout
          conventions —{' '}<code>cmd/</code>{' '}for entry points,{' '}
          <code>internal/</code>{' '}for non-importable domain code,{' '}
          <code>pkg/</code>{' '}for code other binaries can reuse — applied
          to a real SaaS shape.
        </P>
      )}
      {!isNode && (
        <>
          <P>
            <strong>What goes in <code>internal/</code>{' '}vs <code>pkg/</code></strong> is
            the most common Go SaaS question. The rule that holds up at
            scale:
          </P>
          <P>
            <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
              <li>
                <code>internal/</code>{' '}— code Go forbids other modules
                from importing. Use it for everything that's domain-specific:
                handlers, services, models, route mounting
              </li>
              <li>
                <code>pkg/</code>{' '}— code other binaries CAN import. Use it
                for genuinely reusable libraries: the{' '}
                <a href="/docs/rbac" style={{ color: '#1a1a1a', fontWeight: 600 }}>
                  RBAC engine
                </a>
                , the storage abstraction, anything you'd extract into a
                separate repo later
              </li>
            </ul>
          </P>
          <P>
            The kit splits exactly this way. The RBAC engine in{' '}
            <code>pkg/rbac/</code>{' '}is reusable across any Go service
            that needs a policy doc; the handlers in{' '}
            <code>internal/handler/</code>{' '}are checkout-kit-specific and
            shouldn't leak to other projects.
          </P>
        </>
      )}
      <P>
        The Stripe + RBAC + webhook layers all build on this base layout —
        if you want to see how they compose end-to-end, the{' '}
        <a href="/docs/checkout" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          checkout
        </a>{', '}
        <a href="/docs/rbac" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          RBAC
        </a>{', and '}
        <a href="/docs/webhook" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          webhook
        </a>{' '}pages each show the relevant slice of this structure in
        action.
      </P>

      <H2>Top level</H2>
      <CodeBlock
        language="bash"
        filename="checkout-kit/"
        code={`checkout-kit/
├── api/                          # Bruno collection (43 .bru files)
├── client/                       # Frontend monorepo
│   ├── api/                      # API domain layer (live + mock)
│   ├── shared/                   # FE-cross-flavor utilities
│   ├── mui/                      # MUI flavor app
│   └── tailwind/                 # Tailwind flavor (coming soon)
├── server/                       # ${isNode ? 'Node backend' : 'Go backend'}
${
  isNode
    ? `│   ├── src/api/                  # express server entry
│   ├── src/seed/                 # seed users/products/orders
│   ├── src/controllers/          # express handlers
│   ├── src/services/             # business logic
│   ├── src/models/               # mongoose schemas
│   ├── src/routes/               # route mounting
│   ├── src/middleware/           # RBAC, auth, body limit, ...
│   ├── src/lib/rbac/             # RBAC engine (reusable)
│   ├── src/lib/storage/          # S3 client
│   └── src/seed-data/            # .json fixture files`
    : `│   ├── cmd/api/                  # main: HTTP server
│   ├── cmd/seed/                 # main: seed users/products/orders
│   ├── internal/handler/         # gin handlers
│   ├── internal/service/         # business logic
│   ├── internal/model/           # Mongo schemas
│   ├── internal/route/           # route mounting
│   ├── internal/middleware/      # RBAC, auth, body limit, ...
│   ├── pkg/rbac/                 # RBAC engine (reusable)
│   ├── pkg/storage/              # S3 client
│   └── seed/                     # .json fixture files`
}
└── docs/                         # in-repo design notes`}
      />

      <H2>Frontend layout (MUI flavor)</H2>
      <P>
        The FE is monorepo-style so the MUI app and the future Tailwind
        app share a single API + state layer. Only the rendering folder
        is flavor-specific.
      </P>
      <CodeBlock
        language="bash"
        filename="client/"
        code={`client/
├── api/                          # SHARED — provider pattern
│   ├── _shared/                  # axios client, error model, attempt()
│   ├── auth/      live/  mock/   # per-domain: live + mock + types
│   ├── me/        live/  mock/
│   ├── products/  live/  mock/
│   ├── cart/      live/  mock/
│   ├── checkout/  live/  mock/
│   ├── orders/    live/  mock/
│   └── policies/  live/  mock/
├── shared/                       # SHARED — stores, forms, RBAC, hooks
│   ├── store/   (Valtio + persist)
│   ├── forms/   (useApiSubmit + VALIDATION_ERROR auto-map)
│   ├── rbac/    (route guards)
│   └── hooks/   (useCall, ...)
├── mui/                          # MUI flavor
│   └── src/
│       ├── app/         (AppProviders, AppRouter, PolicyBootstrap)
│       ├── components/  (BrandMark, layout, fields, demo, ...)
│       ├── features/    (auth, storefront, cart, checkout, orders, admin)
│       ├── theme/       (tokens + theme factory)
│       └── docs/        (this documentation)
└── tailwind/                     # Tailwind flavor (coming soon)`}
      />

      <H2>Backend layout ({isNode ? 'Node + Express' : 'Go'})</H2>
      {isNode ? (
        <CodeBlock
          language="bash"
          filename="server/"
          code={`server/
├── src/
│   ├── api/
│   │   ├── index.ts          # express entry — middleware + router mount
│   │   └── server.ts         # http.Server start + graceful shutdown
│   ├── seed/index.ts         # idempotent seeding (npm run seed)
│   ├── controllers/          # express handlers (one file per entity)
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── checkout.controller.ts
│   │   ├── order.controller.ts
│   │   └── webhook.controller.ts
│   ├── services/             # domain logic + AppError(code, status)
│   ├── models/               # mongoose schemas (Product, Order, ...)
│   ├── routes/               # router(deps) + per-area RBAC gates
│   ├── middleware/           # requireAuth, requireRole, rbacGate, errorHandler
│   ├── config/               # zod env loader
│   ├── db/                   # mongoose connect + ensureIndexes
│   ├── lib/
│   │   ├── rbac/             # engine (policy → decision)
│   │   └── storage/          # ObjectStore interface + S3 impl
│   └── seed-data/            # .json fixture files
├── tsconfig.json
└── package.json`}
        />
      ) : (
        <CodeBlock
          language="bash"
          filename="server/"
          code={`server/
├── cmd/
│   ├── api/main.go         # HTTP server entry
│   └── seed/main.go        # idempotent seeding
├── internal/
│   ├── handler/            # gin handlers (one file per entity)
│   ├── service/            # domain logic + sentinels (ErrSlugTaken, ...)
│   ├── model/              # Mongo entities with bson + json tags
│   ├── route/              # Mount(r, deps) + per-area RBAC gates
│   ├── middleware/         # RequireAuth, RequireRole, RBACGate
│   ├── config/             # env loader
│   ├── db/                 # Mongo client + EnsureIndexes
│   └── apperr/             # error sentinels
├── pkg/
│   ├── rbac/               # engine (policy → decision)
│   └── storage/            # ObjectStore interface + S3 impl
└── seed/                   # .json fixture files`}
        />
      )}

      {isNode ? (
        <Callout variant="tip" title="Why mongoose + thin services">
          Each entity in <code>src/models/</code> is a Mongoose schema
          with virtuals and validation. Services in{' '}
          <code>src/services/</code> orchestrate them — controllers stay
          thin (parse, call service, respond). The kit ships without a
          DTO layer to keep the surface small; a separate wire-shape
          interface is the natural addition when a buyer needs admin
          endpoints to expose fields the public ones must hide.
        </Callout>
      ) : (
        <Callout variant="tip" title="Why one model serves storage AND wire">
          Each entity in <code>internal/model/</code> carries both{' '}
          <code>bson:</code> and <code>json:</code> tags. Mongo and HTTP both
          decode the same struct. The kit ships without a DTO layer to keep
          the surface small; a separate wire-shape struct is the natural
          addition when a buyer needs admin endpoints to expose fields the
          public ones must hide.
        </Callout>
      )}
    </>
  );
}
