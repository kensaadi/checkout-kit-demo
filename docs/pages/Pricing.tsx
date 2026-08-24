import { useEffect, useState } from 'react';
import { Callout } from '../components/Callout';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';
import type { BeFlavor } from '../navigation';
import {
  faqPageSchema,
  softwareApplicationSchema,
  type Offer,
} from '../../seo/jsonLd';

/**
 * Pricing page. The active BE selector decides which edition's
 * tiers are shown (Go or Node). Both editions are live; only the
 * backend you ship with changes — FE (MUI + Tailwind) is identical
 * across editions.
 *
 * Positioning:
 *   - Go is premium (lower-competition, more demanding buyers).
 *   - Node is accessible (higher-volume, more competitive market).
 *   - Team tier is the conversion center: visually dominant +
 *     "BEST VALUE" eyebrow.
 */

type Tier = {
  badge?: string;
  name: string;
  priceUsd: number;
  highlight?: boolean;
  scope: string[];
  purchaseUrl: string;
};

const GO_TIERS: Tier[] = [
  {
    name: 'Developer',
    priceUsd: 399,
    purchaseUrl: 'https://buy.stripe.com/5kQbJ12th7Hn1jGacNgnK03',
    scope: [
      '1 developer',
      '1 product',
      '1 production deploy',
      'Community Discord support',
    ],
  },
  {
    name: 'Team',
    badge: 'Most popular',
    priceUsd: 899,
    highlight: true,
    purchaseUrl: 'https://buy.stripe.com/aFafZhfg3bXD5zW84FgnK04',
    scope: [
      'Up to 5 developers in 1 organisation',
      'Up to 3 production deploys',
      'Priority Discord support',
      '2h implementation support (live session)',
    ],
  },
  {
    name: 'Extended',
    priceUsd: 1999,
    purchaseUrl: 'https://buy.stripe.com/bJedR9aZN0eV3rO5WxgnK05',
    scope: [
      'Unlimited developers in 1 organisation',
      'Unlimited production deploys',
      'White-label rights',
      'Priority + SLA support',
      '4h implementation support (dedicated sessions)',
    ],
  },
];

const NODE_TIERS: Tier[] = [
  {
    name: 'Developer',
    priceUsd: 299,
    purchaseUrl: 'https://buy.stripe.com/9B6eVdgk71iZgeA70BgnK06',
    scope: [
      '1 developer',
      '1 product',
      '1 production deploy',
      'Community Discord support',
    ],
  },
  {
    name: 'Team',
    badge: 'Most popular',
    priceUsd: 699,
    highlight: true,
    purchaseUrl: 'https://buy.stripe.com/8x2bJ12th1iZ9Qc1GhgnK07',
    scope: [
      'Up to 5 developers in 1 organisation',
      'Up to 3 production deploys',
      'Priority Discord support',
      '2h implementation support (live session)',
    ],
  },
  {
    name: 'Extended',
    priceUsd: 1499,
    purchaseUrl: 'https://buy.stripe.com/28E6oH4Bp2n30fCckVgnK08',
    scope: [
      'Unlimited developers in 1 organisation',
      'Unlimited production deploys',
      'White-label rights',
      'Priority + SLA support',
      '4h implementation support (dedicated sessions)',
    ],
  },
];

function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

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

export function Pricing() {
  const { be, setBe } = useDocs();
  const isNode = be === 'node';
  const tiers = isNode ? NODE_TIERS : GO_TIERS;
  const editionLabel = isNode ? 'Node Edition' : 'Go Edition';
  const isMdUp = useMinWidth(900);

  const offers: Offer[] = tiers.map((t) => ({
    name: `${editionLabel} · ${t.name}`,
    priceUsd: t.priceUsd,
    description: t.scope.join(' · '),
  }));

  const seoJsonLd = [
    softwareApplicationSchema({
      name: `checkout-kit · ${editionLabel}`,
      description: `${editionLabel} of checkout-kit — a production-grade Stripe checkout starter for React. Includes MUI + Tailwind frontends, full backend (MongoDB by default, PostgreSQL free on request), Bruno collection, docs.`,
      offers,
    }),
    faqPageSchema([
      {
        question: `Why is ${isNode ? 'Node cheaper than Go' : 'Go priced higher than Node'}?`,
        answer: isNode
          ? 'Node is the bigger, more competitive market — we price for volume and accessibility. The Go edition serves a smaller, more demanding niche willing to pay for performance and tighter binaries.'
          : 'Go has less competition in this product category and serves teams that are typically willing to pay for performance and tighter binaries. Node is priced for the broader, more competitive market.',
      },
      {
        question: 'What does implementation support cover?',
        answer: 'Team and Extended tiers include live sessions where we work directly on your codebase — not a generic walkthrough. Typical use cases: adapting the RBAC policy to your roles, wiring a custom payment flow, integrating your existing auth, or adjusting data models. Sessions are scheduled via email after purchase. Additional hours are available at an hourly rate.',
      },
      {
        question: 'Can I upgrade a tier later?',
        answer: 'Yes — pay the difference, get the new tier. Email us with your purchase id.',
      },
      {
        question: "What counts as a 'production deploy'?",
        answer: 'One application serving customers, regardless of how many environments back it (staging, prod). Internal dashboards and CI runs do not count.',
      },
      {
        question: 'What about tax / VAT?',
        answer: 'Prices are excluding tax. EU/UK customers see VAT added at checkout based on their billing country.',
      },
      {
        question: 'Can I buy both editions?',
        answer: 'Yes — if you already own one edition and want the other, you get 50% off the matching tier of the other edition. Email us with your purchase id, no expiry.',
      },
      {
        question: 'Do you support PostgreSQL instead of MongoDB?',
        answer: 'The kit ships with MongoDB. If you need PostgreSQL, tell us when you buy and we integrate a Postgres data layer for free — same API contracts and Stripe flow, only the persistence layer changes.',
      },
    ]),
  ];

  return (
    <>
      <PageTitle
        eyebrow="Get the kit"
        title="Pricing"
        description="One product, two backend editions. Pick yours below. Both editions ship the same FE (MUI + Tailwind), the same screens, the same Stripe flow — only the backend differs. MongoDB ships by default; PostgreSQL is available free on request (Go or Node)."
        seoJsonLd={seoJsonLd}
      />

      <EditionSwitch be={be} setBe={setBe} />

      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: isMdUp ? 'repeat(3, 1fr)' : '1fr',
          alignItems: 'stretch',
          marginTop: 32,
        }}
      >
        {tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} />
        ))}
      </div>

      <Callout variant="success" title="Implementation support — what it covers">
        Team and Extended tiers include live sessions where we work
        directly on <strong>your</strong> codebase — not a generic
        walkthrough. Typical use cases: adapting the RBAC policy to your
        roles, wiring a custom payment flow, integrating your existing
        auth, or adjusting data models. Sessions are scheduled via email
        at{' '}<span style={{ fontFamily: 'monospace' }}>info@dashforge-ui.com</span>{' '}
        after purchase. Additional hours available at an hourly rate.
      </Callout>

      <Callout variant="tip" title="Prefer PostgreSQL? Just ask — it's on me.">
        The kit ships with <strong>MongoDB</strong> out of the box. If your stack
        is Postgres, tell me when you buy (or before) and I'll integrate a{' '}
        <strong>PostgreSQL data layer for you, free of charge</strong>. Same
        screens, same API contracts, same Stripe flow — only the persistence
        layer changes. Just email me with your purchase id and your preference.
      </Callout>

      <H2>What every tier includes</H2>
      <P>
        Both editions ship the full kit — same screens, same Stripe
        flow, same RBAC engine, same admin dashboard, same Bruno
        collection, same docs. The only difference between editions
        is which backend you receive:
      </P>
      <div
        style={{
          marginTop: 16,
          marginBottom: 32,
          display: 'grid',
          gridTemplateColumns: isMdUp ? 'repeat(2, 1fr)' : '1fr',
          gap: 16,
        }}
      >
        <InclusionCard
          title="Frontend (both editions)"
          items={[
            '✓ MUI flavor — full React app',
            '✓ Tailwind flavor — full React app',
            '✓ Dark mode + theme tokens',
            '✓ 17+ premium pages, sticky checkout',
            '✓ Admin dashboard with sales chart',
            '✓ Drag-drop S3 image upload',
          ]}
        />
        <InclusionCard
          title={isNode ? 'Node backend (this edition)' : 'Go backend (this edition)'}
          items={
            isNode
              ? [
                  '✓ Express + TypeScript',
                  '✓ MongoDB + Mongoose',
                  '✓ JWT + bcrypt',
                  '✓ Stripe SDK + webhook handlers',
                  '✓ S3 image storage',
                  '✓ RBAC engine + 3 middleware',
                ]
              : [
                  '✓ Go + Gin',
                  '✓ MongoDB driver (no ORM)',
                  '✓ JWT + bcrypt',
                  '✓ Stripe Go SDK + webhook handlers',
                  '✓ S3 image storage',
                  '✓ RBAC engine + 3 middleware',
                ]
          }
        />
      </div>

      <H2>FAQ</H2>
      <FaqRow
        q={`Why is ${isNode ? 'Node cheaper than Go' : 'Go priced higher than Node'}?`}
        a={
          isNode
            ? 'Node is the bigger, more competitive market — we price for volume and accessibility. If you want the same kit on Go, switch the toggle: identical FE, different backend, premium pricing.'
            : 'Go has less competition in this product category and serves teams that are typically willing to pay for performance + tighter binaries. Node is priced for the broader, more competitive market.'
        }
      />
      <FaqRow
        q="Can I upgrade a tier later?"
        a="Yes — pay the difference, get the new tier. Just email us with your purchase id."
      />
      <FaqRow
        q="What counts as a 'production deploy'?"
        a="One application serving customers, regardless of how many environments back it (staging, prod). Internal dashboards and CI runs don't count."
      />
      <FaqRow
        q="What about tax / VAT?"
        a="Prices above are excluding tax. EU/UK customers see VAT added at checkout based on their billing country."
      />
      <FaqRow
        q="Can I buy both editions?"
        a="Yes — if you already own one edition and want the other, you get 50% off the matching tier of the other edition. Email us with your purchase id, no expiry."
      />
      <FaqRow
        q="Do you support PostgreSQL instead of MongoDB?"
        a="The kit ships with MongoDB, but if you'd rather run Postgres just tell me when you buy — I'll integrate a PostgreSQL data layer for you, free of charge. Same screens, same API contracts, same Stripe flow; only the persistence layer changes."
      />
    </>
  );
}

function EditionSwitch({
  be,
  setBe,
}: {
  be: BeFlavor;
  setBe: (b: BeFlavor) => void;
}) {
  const isNode = be === 'node';
  const isSmUp = useMinWidth(600);
  const isMdUp = useMinWidth(900);
  return (
    <div
      style={{
        marginBottom: 32,
        padding: isMdUp ? 8 : 6,
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        border: '1px solid #E5E7EB',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isSmUp ? 'row' : 'column',
          gap: isSmUp ? 8 : 6,
          width: '100%',
        }}
      >
        <EditionButton
          active={!isNode}
          onClick={() => setBe('go')}
          flag="🟦"
          name="Go Edition"
          subtitle="Premium · from $399"
          status={{ label: '✓ Available', color: '#065F46', bg: '#D1FAE5' }}
        />
        <EditionButton
          active={isNode}
          onClick={() => setBe('node')}
          flag="🟩"
          name="Node Edition"
          subtitle="Accessible · from $299"
          status={{ label: '✓ Available', color: '#065F46', bg: '#D1FAE5' }}
        />
      </div>
      <div
        style={{
          marginTop: 12,
          textAlign: 'center',
          fontSize: '12px',
          color: '#6B7280',
        }}
      >
        Pick an edition above — prices, tiers and CTAs update live.
        Your choice syncs with the{' '}
        <span style={{ fontWeight: 700, color: '#1a1a1a' }}>
          BE selector
        </span>{' '}
        in the docs top bar.
      </div>
    </div>
  );
}

function EditionButton({
  active,
  onClick,
  flag,
  name,
  subtitle,
  status,
}: {
  active: boolean;
  onClick: () => void;
  flag: string;
  name: string;
  subtitle: string;
  status: { label: string; color: string; bg: string };
}) {
  const isMdUp = useMinWidth(900);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        appearance: 'none',
        cursor: 'pointer',
        flex: 1,
        textAlign: 'left',
        padding: isMdUp ? 20 : 16,
        borderRadius: '10px',
        background: active ? '#000' : '#fff',
        color: active ? '#fff' : '#1a1a1a',
        border: active ? '2px solid #000' : '1px solid #E5E7EB',
        transition: 'transform .15s ease, box-shadow .2s ease, background .15s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 4,
        }}
      >
        <div style={{ fontSize: '22px', lineHeight: 1 }}>{flag}</div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            color: 'inherit',
          }}
        >
          {name}
        </div>
        <div style={{ flex: 1 }} />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: status.bg,
            color: status.color,
            fontSize: '10.5px',
            fontWeight: 700,
            border: 'none',
            height: 22,
            padding: '0 8px',
            borderRadius: '999px',
          }}
        >
          {status.label}
        </span>
      </div>
      <div
        style={{
          fontSize: '13px',
          color: active ? 'rgba(255,255,255,0.78)' : '#6B7280',
          fontWeight: 500,
        }}
      >
        {subtitle}
      </div>
    </button>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const isMdUp = useMinWidth(900);
  const highlightMargin = tier.highlight ? (isMdUp ? -16 : 8) : 0;
  return (
    <div
      style={{
        position: 'relative',
        padding: 28,
        borderRadius: '14px',
        border: tier.highlight ? '2px solid #000' : '1px solid #EEEEEE',
        background: '#fff',
        boxShadow: tier.highlight
          ? '0 12px 32px rgba(0,0,0,0.12)'
          : '0 1px 2px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        marginTop: highlightMargin,
        marginBottom: highlightMargin,
      }}
    >
      {tier.badge && (
        <span
          style={{
            position: 'absolute',
            top: -10,
            left: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 24,
            padding: '0 8px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #3B82F6 100%)',
            color: '#fff',
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
          }}
        >
          {tier.badge}
        </span>
      )}
      {tier.highlight && (
        <div
          style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#3B82F6',
            textTransform: 'uppercase',
            marginBottom: -8,
          }}
        >
          ★ Best value
        </div>
      )}
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
        {tier.name}
      </div>
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'baseline' }}>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#1a1a1a',
              lineHeight: 1,
            }}
          >
            {formatUsd(tier.priceUsd)}
          </div>
          <div style={{ fontSize: '13px', color: '#8A8A8A' }}>
            one-time
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tier.scope.map((s) => (
            <div
              key={s}
              style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}
            >
              <div style={{ fontSize: '14px', color: '#059669', lineHeight: 1.5 }}>
                ✓
              </div>
              <div style={{ fontSize: '13.5px', color: '#374151', lineHeight: 1.5 }}>
                {s}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.open(tier.purchaseUrl, '_blank', 'noopener,noreferrer')}
        style={{
          appearance: 'none',
          cursor: 'pointer',
          width: '100%',
          paddingTop: 12,
          paddingBottom: 12,
          borderRadius: '8px',
          background: tier.highlight ? '#000' : '#fff',
          color: tier.highlight ? '#fff' : '#1a1a1a',
          fontWeight: 700,
          fontSize: '14px',
          border: tier.highlight ? 'none' : '1.5px solid #1a1a1a',
          transition: 'transform .15s ease, box-shadow .2s ease',
        }}
      >
        Buy this tier
      </button>
    </div>
  );
}

function InclusionCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: '10px',
        border: '1px solid #EEEEEE',
        background: '#FAFAFA',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#8A8A8A',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it) => (
          <div
            key={it}
            style={{ fontSize: '13.5px', color: '#1a1a1a', lineHeight: 1.5 }}
          >
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <div
      style={{
        paddingTop: 16,
        paddingBottom: 16,
        borderBottom: '1px solid #EEEEEE',
      }}
    >
      <div
        style={{ fontSize: '14.5px', fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}
      >
        {q}
      </div>
      <div style={{ fontSize: '14px', color: '#545454', lineHeight: 1.6 }}>
        {a}
      </div>
    </div>
  );
}
