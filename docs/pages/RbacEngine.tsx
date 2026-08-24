import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function RbacEngine() {
  const { be } = useDocs();
  const isNode = be === 'node';

  return (
    <>
      <PageTitle
        eyebrow="Architecture"
        title={
          isNode
            ? 'RBAC in Express from Scratch — Production Pattern'
            : 'RBAC in Gin from Scratch — Production Pattern'
        }
        description={
          isNode
            ? 'Build a production-grade RBAC engine in Node.js + Express. A JSON policy doc, three composable middleware, field-level access on the React side. Real code from a shipped kit.'
            : 'Build a production-grade RBAC engine in Go + Gin. A JSON policy doc, three composable middleware, field-level access on the React side — same policy powers BE gating and FE field-level access. Real code from a shipped kit.'
        }
      />

      <H2>What RBAC actually is (and what most tutorials get wrong)</H2>
      <P>
        Role-Based Access Control isn't{' '}
        <code>if (user.role === 'admin')</code>. That's role checking — it
        works for a single project that never gets a fourth role, never
        adds a new resource, and never has to answer "why can sales see
        this field but not edit it?" from a compliance audit. In practice,
        most production RBAC bugs come from these ad-hoc checks getting
        out of sync with what the policy was supposed to say.
      </P>
      <P>
        Real RBAC has three layers:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
          <li>
            <strong>A policy</strong> — a document declaring which roles
            can do which actions on which resources, with deny rules that
            override allow rules. The policy is data, not code
          </li>
          <li>
            <strong>An engine</strong> — pure code that takes (subject,
            action, resource) and returns allow/deny against the policy.
            No HTTP, no DB, easily unit-testable
          </li>
          <li>
            <strong>Enforcement points</strong> — where the engine is
            consulted: route middleware (BE), field guards (FE), and
            increasingly for service-to-service calls in microservice
            setups
          </li>
        </ul>
      </P>
      <P>
        The kit ships exactly this shape{' '}
        {isNode ? 'in Node.js' : 'in Go'} —{' '}
        a single JSON policy, an engine package, and three composable
        middleware functions that mount per-route. Plus a React side
        that loads the same policy and gates fields by{' '}
        <code>&lt;Can&gt;</code> or <code>access</code> prop.
      </P>

      <H2>Why one policy doc for BE and FE</H2>
      <P>
        Conventional wisdom says backend decides, frontend obeys. That
        creates two real problems in production:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
          <li>
            <strong>UX rot</strong>: the FE shows a button the BE will
            reject. The user clicks, sees a 403 toast, files a ticket.
            "Why is the button there if I can't use it?"
          </li>
          <li>
            <strong>Policy drift</strong>: the FE re-implements role
            checks ad-hoc. Six months later, the BE policy is updated;
            the FE forgets. Sales can no longer reach a screen they
            should be able to reach
          </li>
        </ul>
      </P>
      <P>
        Loading the policy once on the FE (via the public{' '}
        <code>/v1/policies</code> endpoint) and feeding it to a small
        <code>&lt;Can&gt;</code> component fixes both. The BE still
        enforces — never trust the client — but the UI never proposes
        an action the policy will refuse. The kit's{' '}
        <a href="/docs/admin-products" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          admin products screen
        </a>{' '}shows the pattern in action: same JSX for admin and sales,
        sales sees the form rendered read-only with lock icons.
      </P>

      <H2>The policy</H2>
      <P>
        A single document at{' '}
        <code>{isNode ? 'src/seed-data/policies.json' : 'seed/policies.json'}</code>{' '}
        defines every role + its permissions. The kit ships with three roles:
        <strong> admin</strong> (wildcard),{' '}<strong>sales</strong>{' '}
        (read-only across most resources), and{' '}<strong>customer</strong>{' '}
        (own data + cart + checkout). On boot the BE loads it, validates
        it, and builds the decision engine once. A future hot-reload is
        the natural V1.5 addition.
      </P>
      <CodeBlock
        filename={isNode ? 'server/src/seed-data/policies.json' : 'server/seed/policies.json'}
        language="json"
        code={`{
  "roles": [
    { "name": "admin", "permissions": [
      { "action": "*", "resource": "*", "effect": "allow" }
    ]},
    { "name": "customer", "permissions": [
      { "action": "read",   "resource": "self",     "effect": "allow" },
      { "action": "update", "resource": "self",     "effect": "allow" },
      { "action": "read",   "resource": "products", "effect": "allow" },
      { "action": "read",   "resource": "orders",   "effect": "allow" },
      { "action": "create", "resource": "orders",   "effect": "allow" },
      { "action": "read",   "resource": "cart",     "effect": "allow" },
      { "action": "create", "resource": "cart",     "effect": "allow" },
      { "action": "update", "resource": "cart",     "effect": "allow" },
      { "action": "delete", "resource": "cart",     "effect": "allow" },
      { "action": "read",   "resource": "checkout", "effect": "allow" },
      { "action": "create", "resource": "checkout", "effect": "allow" }
    ]}
  ]
}`}
      />

      <H2>Three middleware</H2>
      <P>
        Compose them per-route.{' '}
        <code>{isNode ? 'requireAuth' : 'RequireAuth'}</code> verifies the
        JWT and stashes the subject id.{' '}
        <code>{isNode ? 'requireRole' : 'RequireRole'}</code> guards
        an area (admin + sales for the back office, customer for the
        storefront).{' '}
        <code>{isNode ? 'rbacGate(resource, action)' : 'RBACGate(resource, action)'}</code>{' '}
        consults the policy engine.
      </P>

      {isNode ? (
        <CodeBlock
          filename="server/src/routes/index.ts"
          language="typescript"
          code={`const authMW = requireAuth(deps.jwtSecret);
const v1 = router.use('/v1', authMW);

// Staff area
const staffArea = v1.use(requireRole('admin', 'sales'));
staffArea.get('/me',
    rbacGate(deps.rbac, 'self', 'read'),
    deps.controllers.me.getMe,
);

// Customer area
const customerArea = v1.use(requireRole('customer'));
customerArea.post('/cart/items',
    rbacGate(deps.rbac, 'cart', 'create'),
    deps.controllers.cart.addItem,
);`}
        />
      ) : (
        <CodeBlock
          filename="server/internal/route/route.go"
          language="go"
          code={`authMW := middleware.RequireAuth(d.JWTSecret)
protected := rg.Group("", authMW)

// Staff area
staffArea := protected.Group("", middleware.RequireRole("admin", "sales"))
staffArea.GET("/me",
    middleware.RBACGate(d.RBAC, "self", "read"),
    d.Me.GetMe,
)

// Customer area
customerArea := protected.Group("", middleware.RequireRole("customer"))
customerArea.POST("/cart/items",
    middleware.RBACGate(d.RBAC, "cart", "create"),
    d.Cart.AddItem,
)`}
        />
      )}

      <H2>FE field-level</H2>
      <P>
        On the FE, the same policy is loaded once via{' '}
        <code>/v1/policies</code> (public endpoint) and fed into{' '}
        <code>RbacProvider</code>. <code>&lt;Can /&gt;</code> components
        and field <code>access</code> props read it.
      </P>
      <CodeBlock
        filename="profile form"
        language="tsx"
        code={`<InputField
  name="firstName"
  label="First name"
  access={{
    resource: 'self',
    action: 'update',
    onUnauthorized: 'readonly',  // sales sees the field locked
  }}
/>

<Can action="create" resource="checkout" fallback={null}>
  <Button onClick={() => navigate('/checkout')}>
    Proceed to checkout
  </Button>
</Can>`}
      />

      <Callout variant="tip" title="Why /v1/policies is public">
        The policy is metadata — role names + permission tuples — not
        per-subject decisions. Making it public removes a boot-time
        chicken-and-egg (the FE needed it before authenticating) and
        adds no data exposure: anyone can read it because it's static.
      </Callout>
    </>
  );
}
