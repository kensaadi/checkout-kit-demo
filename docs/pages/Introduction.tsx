import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P } from '../components/PageTitle';
import { useDocs } from '../DocsContext';
import { Seo } from '../../seo';
import {
  breadcrumbSchema,
  combineJsonLd,
  softwareApplicationSchema,
  techArticleSchema,
} from '../../seo/jsonLd';

const features = [
  { emoji: '🛍️', label: 'Public storefront — catalog + product detail' },
  { emoji: '🛒', label: 'Cart (currency-locked, single per customer)' },
  { emoji: '💳', label: '3-step Stripe checkout (Elements + Setup Intent)' },
  { emoji: '📋', label: 'Orders with immutable snapshot at checkout' },
  { emoji: '🔔', label: 'Stripe webhook (succeeded / failed / refunded)' },
  { emoji: '🛡️', label: 'RBAC engine with role inheritance + field-level' },
  { emoji: '⚙️', label: 'Admin: products CRUD + S3 image upload' },
  { emoji: '📊', label: 'Admin dashboard with sales chart + activity feed' },
  { emoji: '🧪', label: 'Provider pattern — live + mock per domain' },
  { emoji: '🎨', label: 'MUI + dark mode + DashForge tokens' },
  { emoji: '🍱', label: 'Bruno API collection — 43 files, run in one click' },
  { emoji: '✅', label: '314 vitest cases passing — mock + live + mapper' },
];

const stackGoMui = [
  { label: 'React 19', category: 'Frontend' },
  { label: 'Vite 5', category: 'Frontend' },
  { label: 'MUI v9', category: 'Frontend' },
  { label: 'Valtio', category: 'Frontend' },
  { label: 'Zod', category: 'Frontend' },
  { label: 'Go 1.24', category: 'Backend' },
  { label: 'Gin', category: 'Backend' },
  { label: 'MongoDB', category: 'Backend' },
  { label: 'Stripe Elements', category: 'Payments' },
  { label: 'S3-compatible storage', category: 'Storage' },
];

const categoryColors: Record<string, { bg: string; color: string }> = {
  Frontend: { bg: '#DBEAFE', color: '#1D4ED8' },
  Backend: { bg: '#D1FAE5', color: '#065F46' },
  Payments: { bg: '#FEE2E2', color: '#991B1B' },
  Storage: { bg: '#FEF3C7', color: '#92400E' },
};

/** True when the viewport matches the given min-width media query. */
function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`;
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function Introduction() {
  const navigate = useNavigate();
  const { version } = useDocs();
  const isSmUp = useMinWidth(600);
  const isMdUp = useMinWidth(900);

  return (
    <div>
      <Seo
        title="Documentation · First production-grade Go SaaS starter"
        description="Docs for checkout-kit — the first production-grade Go SaaS starter. Go + Gin project layout, RBAC engine, Stripe webhook idempotency, admin dashboard, S3 image upload, installation guide. MongoDB by default, PostgreSQL free on request (Go or Node). Node backend and Tailwind also documented."
        canonicalPath="/docs"
        jsonLd={combineJsonLd(
          techArticleSchema({
            headline: 'checkout-kit documentation — Go SaaS starter',
            description:
              'First production-grade Go SaaS starter for React. Go + Gin layout, RBAC engine, Stripe webhook idempotency, admin dashboard, S3 image upload.',
            path: '/docs',
            section: 'Getting Started',
          }),
          softwareApplicationSchema({
            name: 'checkout-kit',
            description:
              'The first production-grade Go SaaS starter kit. Stripe checkout, RBAC, admin dashboard. Node and Tailwind also included.',
            offers: [
              { name: 'Node Edition · Developer', priceUsd: 299, description: '1 dev · 1 production deploy · source code included · community support' },
              { name: 'Node Edition · Team', priceUsd: 699, description: '5 devs · 3 production deploys · 2h implementation support · priority support' },
              { name: 'Node Edition · Extended', priceUsd: 1499, description: 'Unlimited devs · unlimited deploys · 4h implementation support · white-label rights · SLA support' },
              { name: 'Go Edition · Developer', priceUsd: 399, description: '1 dev · 1 production deploy · source code included · community support' },
              { name: 'Go Edition · Team', priceUsd: 899, description: '5 devs · 3 production deploys · 2h implementation support · priority support' },
              { name: 'Go Edition · Extended', priceUsd: 1999, description: 'Unlimited devs · unlimited deploys · 4h implementation support · white-label rights · SLA support' },
            ],
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Docs', path: '/docs' },
          ]),
        )}
      />
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 24,
              padding: '0 8px',
              borderRadius: '999px',
              background: '#F3F4F6',
              fontSize: '11px',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            {version}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 24,
              padding: '0 8px',
              borderRadius: '999px',
              background: '#000',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            Starter Kit
          </span>
        </div>

        <h1
          style={{
            fontSize: isMdUp ? 36 : 28,
            fontWeight: 800,
            lineHeight: 1.15,
            margin: 0,
            marginBottom: 16,
            color: '#1a1a1a',
            letterSpacing: '-0.02em',
          }}
        >
          Checkout Kit
        </h1>

        <p
          style={{
            fontSize: '17px',
            color: '#545454',
            lineHeight: 1.7,
            maxWidth: 640,
            margin: 0,
          }}
        >
          The first production-grade Go SaaS starter kit. Storefront,
          cart, three-step Stripe wizard, orders, admin dashboard with
          S3 image upload — every screen wired to a real Go + Gin
          backend, ready to extract into your product. Node backend
          and Tailwind frontend also included.
        </p>
      </div>

      <div
        style={{
          padding: 24,
          borderRadius: '10px',
          background: '#000',
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#555',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Quick Start
        </div>
        <CodeBlock
          code={`# 1. Install client dependencies
cd client && npm install

# 2. Copy environment template
cp client/mui/.env.example client/mui/.env
cp server/.env.example server/.env

# 3. Seed the database and run BE + FE
cd server && go run ./cmd/seed && go run ./cmd/api &
cd client/mui && npm run dev`}
          language="bash"
        />
        <span
          onClick={() => navigate('/docs/installation')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '13px',
            color: '#09B675',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Full installation guide →
        </span>
      </div>

      <Callout variant="success" title="Skip three weeks of Stripe + RBAC work">
        A Stripe-secured checkout, an RBAC engine, S3 image upload, and
        a real admin dashboard typically take 3 weeks of careful work.
        With the kit, you're up in a day.
      </Callout>

      <H2>What's inside</H2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isSmUp ? 'repeat(2, 1fr)' : '1fr',
          gap: 12,
          marginBottom: 40,
        }}
      >
        {features.map((f) => (
          <div
            key={f.label}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: 14,
              borderRadius: '8px',
              border: '1px solid #EEEEEE',
              background: '#FAFAFA',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1, marginTop: '1px' }}>
              {f.emoji}
            </span>
            <span
              style={{ fontSize: '13.5px', color: '#1a1a1a', lineHeight: 1.4 }}
            >
              {f.label}
            </span>
          </div>
        ))}
      </div>

      <H2>Stack</H2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
        {stackGoMui.map((s) => {
          const c = categoryColors[s.category] ?? {
            bg: '#F3F4F6',
            color: '#6B7280',
          };
          return (
            <div
              key={s.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                borderRadius: '6px',
                border: '1px solid #EEEEEE',
                background: '#fff',
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: c.color,
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>
                {s.label}
              </span>
              <span style={{ fontSize: '11px', color: '#8A8A8A' }}>
                {s.category}
              </span>
            </div>
          );
        })}
      </div>

      <H2>Two flavors, one kit</H2>
      <P>
        The kit ships in two frontend flavors (<strong>MUI</strong> and{' '}
        <strong>Tailwind</strong>) and two backend flavors (<strong>Go</strong>{' '}
        and <strong>Node</strong>). Pick the combination your team uses — the
        public API and data shapes are identical across flavors, so a customer
        running MUI+Go can swap to Tailwind+Node without rewriting their
        business logic.
      </P>
      <P>
        Switch the selectors in the top bar to see how each combination is
        documented. The MUI+Go variant is live in v1.0.0; Tailwind and Node
        land in the next release.
      </P>

      <Callout variant="tip" title="Provider pattern">
        Every API domain (auth, products, cart, checkout, orders) has a
        <code> live </code>provider (axios → BE) and a<code> mock </code>
        provider (in-memory). Flip <code>VITE_PROVIDER=mock</code> in
        <code> .env </code>and the kit runs offline against simulated data —
        useful for UI work, demos, and CI.
      </Callout>
    </div>
  );
}
