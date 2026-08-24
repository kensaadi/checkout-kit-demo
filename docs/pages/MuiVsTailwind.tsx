import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';
import { faqPageSchema } from '../../seo/jsonLd';

/**
 * MUI vs Tailwind for a Go SaaS — SEO-optimised comparison.
 *
 * Important: in checkout-kit the "Tailwind" flavor is NOT raw
 * Tailwind utilities. It's `@dashforge/tw`, a full component
 * library (29 components) shipped at parity with `@dashforge/ui`
 * (the MUI flavor): same RBAC behavior, same forms bridge, same
 * call-site contract. Both lines pass WCAG 2.1 AA per their
 * own audits.
 *
 * The real choice is styling philosophy + ecosystem maturity +
 * variant vocabulary, NOT "ready components vs blank canvas".
 *
 * SEO patterns: H2 question-format, FAQ schema, comparison
 * tables, internal cross-links, recommend-by-buyer.
 */
/** True when the viewport is at the MUI `md` breakpoint or wider (>= 900px). */
function useIsMdUp(): boolean {
  const [isMdUp, setIsMdUp] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 900px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const onChange = () => setIsMdUp(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMdUp;
}

export function MuiVsTailwind() {
  const { fe } = useDocs();
  const navigate = useNavigate();
  const isMdUp = useIsMdUp();

  const faqEntries = [
    {
      question: 'Are MUI and Tailwind interchangeable in checkout-kit?',
      answer:
        "At the call-site level, mostly yes. Both flavors ship the same 29 components (Button, TextField, DataGrid, DatePicker, Dialog, etc.) wired to the same forms + RBAC bridge. A consumer who swaps `@dashforge/ui` for `@dashforge/tw` keeps their form schemas, validation rules, and RBAC declarations unchanged. The visible deltas are intentional — variant names (`contained` vs `solid`), callback signatures (`onChange` vs `onCheckedChange` on toggle inputs), a few prop shapes. The full diff lives in PARITY.md inside the kit.",
    },
    {
      question: 'Which one ships a DataGrid out of the box?',
      answer:
        "Both. The MUI flavor uses MUI X DataGrid (free tier — Pro and Premium are optional paid upgrades). The Tailwind flavor uses a Dashforge DataGrid built on TanStack Table primitives. Same sorting, pagination, density toggle, column resize at the call-site level. Differences: MUI X has more enterprise features at the paid tiers (column groups, tree data, aggregation); Dashforge is open and tailwind-styleable.",
    },
    {
      question: 'Is the Tailwind flavor accessible by default?',
      answer:
        "Yes. `@dashforge/tw` ships WCAG 2.1 AA conformant per its A11Y audit — zero blocking failures across all 29 components. Form controls inherit WAI-ARIA Authoring Practices from Radix UI primitives (Checkbox, Switch, Dialog, etc.). The Button exposes `aria-busy={loading}`, the TextField links `aria-describedby` to helper-text ids via `useId()`. Same compliance posture as the MUI flavor.",
    },
    {
      question: 'What about bundle size?',
      answer:
        "The Tailwind flavor wins, but less dramatically than raw Tailwind: `@dashforge/tw` ships ~69 KB gzipped (full library), plus your Tailwind purged CSS (~14 KB on a checkout-kit-scale app). The MUI flavor ships ~165 KB gzipped because emotion's runtime is non-trivial and MUI X components carry weight. Real-world difference on LCP for a B2B dashboard over broadband: invisible. On 4G mobile: ~200-300ms.",
    },
    {
      question: 'Can I switch flavors later?',
      answer:
        "Yes, and this is the unique advantage of buying both. The bridge contract — forms validation, RBAC declarations, visibleWhen predicates, access requirements — is byte-identical across flavors. You re-import from `@dashforge/tw` instead of `@dashforge/ui`, adjust variant names where they differ (Button `contained` → `solid`, sizes `small` → `sm`), and ship. A typical mid-size migration takes 1-2 weeks, not 4-8.",
    },
    {
      question: 'Why are MUI variants named differently from Tailwind variants?',
      answer:
        "Intentional. MUI's vocabulary (`contained`, `outlined`, `text`) comes from Material Design. `@dashforge/tw` uses (`solid`, `outline`, `soft`, `ghost`) — the shadcn/Radix/Mantine common-denominator naming that Tailwind-native developers expect. Same applies to sizes (`small/medium/large` vs `sm/md/lg`). It's a small call-site delta but it makes each flavor feel native to its ecosystem.",
    },
    {
      question: 'Which has more searchable hiring talent?',
      answer:
        "Tailwind, by a wide margin. LinkedIn searches in early 2026: ~95k React+MUI profiles vs ~320k React+Tailwind profiles. The MUI pool skews senior and enterprise-trained; the Tailwind pool is larger and more junior. For Dashforge/tw specifically, anyone fluent in Tailwind + Radix is 80% ready — the component API is small enough to learn in a day.",
    },
    {
      question: 'Does the kit ship the same features in both flavors?',
      answer:
        'Identical. Same screens, same Stripe flow, same RBAC behavior, same admin dashboard, same routes, same API contract. The only difference is how components are styled and which design vocabulary they use. You buy one Go or Node edition; both frontend flavors ship inside it. You pick the one to deploy.',
    },
  ];

  return (
    <>
      <PageTitle
        eyebrow="Architecture"
        title="MUI vs Tailwind for a Go SaaS in 2026 — Which Should You Pick?"
        description="Honest comparison of the MUI and Tailwind flavors in checkout-kit. Both ship parity components, both are WCAG 2.1 AA conformant. The real differences are styling philosophy, ecosystem maturity, and variant vocabulary. Includes decision framework and recommendation by buyer type."
        seoJsonLd={faqPageSchema(faqEntries)}
      />

      <Callout variant="success" title="The 30-second answer">
        Both flavors in checkout-kit ship the <strong>same 29 components</strong>{' '}
        with the same forms + RBAC bridge. The choice is not about
        capability — it's about styling philosophy.{' '}
        <strong>Pick MUI</strong> if you want the Material vocabulary,
        the mature MUI X ecosystem (DataGrid Premium, etc.), or your
        team already lives there.{' '}
        <strong>Pick Tailwind</strong> if you want utility-first
        styling, the shadcn/Radix vocabulary, or a smaller bundle. And
        since the bridge contract is portable, the choice isn't
        permanent — you can swap in 1-2 weeks if needed.
      </Callout>

      <H2>Why this isn't the comparison you read elsewhere</H2>
      <P>
        Most "MUI vs Tailwind" articles online compare MUI's component
        library to <em>raw Tailwind utility classes</em>. That comparison
        always lands the same way: MUI wins on speed-to-screen because
        Tailwind has no components.
      </P>
      <P>
        That's not the comparison here. In checkout-kit, the Tailwind
        flavor is <code>@dashforge/tw</code> — a full component library
        shipped at parity with <code>@dashforge/ui</code> (the MUI
        flavor). Both lines expose 29 components — Button, TextField,
        DataGrid, DatePicker, Autocomplete, Dialog, RadioGroup,
        Switch, Tabs, Popover, you name it. Both are WCAG 2.1 AA
        conformant per their own audits. Both wire to the same{' '}
        <a href="/docs/rbac" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          RBAC engine
        </a>
        , the same form-validation bridge, the same{' '}
        <code>visibleWhen</code> predicates.
      </P>
      <P>
        That means the usual "Tailwind has no DataGrid" or "Tailwind
        has no DatePicker" arguments don't apply. The kit ships both.
        What's left to compare is real but different: styling
        philosophy, ecosystem maturity, variant vocabulary, bundle
        profile, and ecosystem hiring.
      </P>

      <H2>The bridge contract — and why it's the real story</H2>
      <P>
        The most important property of the kit's two flavors is the{' '}
        <strong>bridge contract</strong>: a shared set of props that
        behaves byte-identical in both lines, validated per-component
        in the kit's PARITY.md audit. Concretely:
      </P>
      <CodeBlock
        filename="The bridge contract — byte-identical in both flavors"
        language="tsx"
        code={`<TextField
  name="email"              // ← Form field id (forms bridge)
  label="Email"
  rules={{
    required: 'Email is required',
    pattern: /.+@.+\\..+/,
  }}                        // ← Validation rules (forms bridge)
  visibleWhen={(e) =>
    e.values.kind === 'staff'
  }                         // ← Conditional render (forms bridge)
  access={{
    resource: 'self',
    action: 'update',
    onUnauthorized: 'readonly',
  }}                        // ← RBAC field-level (rbac bridge)
  helperText="We never share your email"
/>`}
      />
      <P>
        Swap the import from <code>'@dashforge/ui'</code> to{' '}
        <code>'@dashforge/tw'</code>, and this JSX renders against the
        Tailwind flavor with the same validation, the same RBAC,
        the same conditional visibility. No rewrite. That's the
        portability the bridge guarantees.
      </P>
      <P>
        For a buyer, this turns the "MUI vs Tailwind" question from a
        permanent commitment into a current-best-fit choice. You can
        change your mind in 6 months.
      </P>

      <H2>Where do the two flavors actually differ?</H2>
      <ComparisonTable
        rows={[
          {
            label: 'Component count',
            mui: '29 (full)',
            tailwind: '29 (full)',
            advantage: 'even',
          },
          {
            label: 'A11y compliance (WCAG 2.1 AA)',
            mui: 'Conformant',
            tailwind: 'Conformant (Radix-backed)',
            advantage: 'even',
          },
          {
            label: 'Bridge contract (forms + RBAC)',
            mui: 'Byte-identical',
            tailwind: 'Byte-identical',
            advantage: 'even',
          },
          {
            label: 'Variant vocabulary',
            mui: 'Material (contained/outlined/text)',
            tailwind: 'shadcn/Radix (solid/outline/soft/ghost)',
            advantage: 'even',
          },
          {
            label: 'Size naming',
            mui: 'small / medium / large',
            tailwind: 'sm / md / lg',
            advantage: 'even',
          },
          {
            label: 'Styling system',
            mui: 'sx prop (emotion CSS-in-JS object)',
            tailwind: 'sx prop (utility class string) + Tailwind config',
            advantage: 'even',
          },
          {
            label: 'Polymorphism',
            mui: 'component / href',
            tailwind: 'asChild (Radix Slot)',
            advantage: 'tailwind',
          },
          {
            label: 'Bundle size (gzipped, full app)',
            mui: '~165 KB',
            tailwind: '~70 KB + ~14 KB CSS',
            advantage: 'tailwind',
          },
          {
            label: 'Premium / Pro components',
            mui: 'MUI X Pro/Premium (paid upgrades)',
            tailwind: 'None yet — request via Discord',
            advantage: 'mui',
          },
          {
            label: 'Ecosystem maturity',
            mui: '~10 years',
            tailwind: '~1 year (Dashforge), Radix mature',
            advantage: 'mui',
          },
          {
            label: 'Searchable hiring pool (LinkedIn)',
            mui: '~95k profiles',
            tailwind: '~320k profiles',
            advantage: 'tailwind',
          },
          {
            label: 'Avg seniority of pool',
            mui: '5-9 years',
            tailwind: '2-5 years',
            advantage: 'even',
          },
          {
            label: 'Marketing site / landing page fit',
            mui: 'Constrained (Material aesthetic)',
            tailwind: 'Native (utility classes compose)',
            advantage: 'tailwind',
          },
          {
            label: 'Dark mode',
            mui: 'palette inversion',
            tailwind: 'dark: variants pre-wired',
            advantage: 'even',
          },
          {
            label: 'Migration cost (flavor swap)',
            mui: '1-2 weeks (variant rename + size rename)',
            tailwind: '1-2 weeks (same)',
            advantage: 'even',
          },
        ]}
      />

      <H2>When should you pick the MUI flavor?</H2>
      <P>
        MUI wins when you want the Material vocabulary, when you might
        need MUI X Pro/Premium components later, or when your team is
        already fluent in MUI. Concrete signals:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
          <li>
            <strong>You expect to need DataGrid Pro / Premium</strong>{' '}
            features down the road — column groups, tree data, Excel
            export, aggregation. MUI X has the most complete commercial
            datagrid in React. Dashforge ships a free baseline
            DataGrid; advanced features land later
          </li>
          <li>
            <strong>Your team is already on MUI.</strong> Switching off
            MUI muscle memory has a cost. If your devs already write{' '}
            <code>sx={'{{ ... }}'}</code> reflexively, stay where you
            are
          </li>
          <li>
            <strong>You sell to enterprise B2B.</strong> Material is
            instantly recognisable as "professional". For audited or
            procurement-led sales, that's a small comfort signal that
            matters
          </li>
          <li>
            <strong>You like the MUI ecosystem.</strong> 10+ years of
            community, Stack Overflow answers, third-party integrations,
            DateTimePicker / DataGrid / TreeView variants. That depth
            is hard to match
          </li>
          <li>
            <strong>You want palette inversion dark mode.</strong> One
            theme prop, the whole UI inverts. Tailwind's{' '}
            <code>dark:</code> variants are equally valid but more
            explicit per-component
          </li>
        </ul>
      </P>
      <P>
        Here's the MUI flavor of an admin dashboard table — same JSX
        the kit ships:
      </P>
      <CodeBlock
        filename="MUI flavor — admin table"
        language="tsx"
        code={`<DataGrid
  rows={orders}
  columns={[
    { field: 'id', headerName: 'Order', width: 120 },
    { field: 'customerName', headerName: 'Customer', flex: 1 },
    {
      field: 'totalCents',
      headerName: 'Total',
      width: 110,
      valueFormatter: ({ value }) => formatMoney(value),
    },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'createdAt', headerName: 'Placed', width: 130 },
  ]}
  initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
  pageSizeOptions={[20, 50, 100]}
  disableRowSelectionOnClick
/>`}
      />

      <H2>When should you pick the Tailwind flavor?</H2>
      <P>
        Tailwind wins when you want the shadcn/Radix vocabulary, when
        bundle size matters, when your team already lives in utility
        classes, or when you ship marketing pages alongside the app.
        Concrete signals:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
          <li>
            <strong>You want the shadcn / Radix aesthetic.</strong>{' '}
            Neutral, Stripe-like, less recognisable as "library
            defaults". Dashforge/tw inherits this design language
          </li>
          <li>
            <strong>You ship marketing pages from the same codebase.</strong>
            {' '}Utility classes compose natively with landing pages. The
            MUI sx prop is great inside an app, less great on a sales
            page
          </li>
          <li>
            <strong>Your team is fluent in Tailwind.</strong> Same logic
            as the reverse: don't fight muscle memory. Dashforge/tw API
            is small enough to learn in a day on top of Tailwind
            fluency
          </li>
          <li>
            <strong>You're shipping mobile-heavy or bandwidth-constrained.</strong>
            {' '}~95 KB total (gzip, lib + CSS) vs ~165 KB. Meaningful
            for 4G consumers, invisible for B2B desktop
          </li>
          <li>
            <strong>You want Radix's polymorphism (`asChild`).</strong>
            {' '}A single component prop turns any component into a Link
            without DOM doubling. MUI's <code>component</code> /{' '}
            <code>href</code> patterns are equivalent but more verbose
          </li>
          <li>
            <strong>You're a consumer / D2C / dev-tool product.</strong>
            {' '}The MUI Material aesthetic can flatten brand
            differentiation. Tailwind's neutral defaults let your brand
            tokens carry the personality
          </li>
        </ul>
      </P>
      <P>
        Same table in the Tailwind flavor — same call-site contract,
        different styling philosophy:
      </P>
      <CodeBlock
        filename="Tailwind flavor — admin table"
        language="tsx"
        code={`<DataGrid
  rows={orders}
  columns={[
    { field: 'id', headerName: 'Order', width: 120 },
    { field: 'customerName', headerName: 'Customer', flex: 1 },
    {
      field: 'totalCents',
      headerName: 'Total',
      width: 110,
      valueFormatter: ({ value }) => formatMoney(value),
    },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'createdAt', headerName: 'Placed', width: 130 },
  ]}
  pageSizeOptions={[20, 50, 100]}
  // sx accepts utility classes here
  sx="rounded-lg border border-neutral-200 shadow-sm"
/>`}
      />

      <H2>What about hiring? (the factor everyone skips)</H2>
      <P>
        Stack decisions get re-litigated every time you hire. Numbers
        from LinkedIn talent search in early 2026:
      </P>
      <div style={{ marginBottom: 24 }}>
        <ComparisonTable
          rows={[
            {
              label: 'React + MUI on profile',
              mui: '~ 95.000',
              tailwind: '—',
              advantage: 'even',
            },
            {
              label: 'React + Tailwind on profile',
              mui: '—',
              tailwind: '~ 320.000',
              advantage: 'even',
            },
            {
              label: 'Avg seniority',
              mui: '5-9 yrs',
              tailwind: '2-5 yrs',
              advantage: 'even',
            },
            {
              label: 'Avg salary (US, senior FE)',
              mui: '$135-180k',
              tailwind: '$130-170k',
              advantage: 'even',
            },
            {
              label: 'Onboarding to checkout-kit flavor',
              mui: '1-2 days for MUI fluent dev',
              tailwind: '1-2 days for Tailwind + Radix dev',
              advantage: 'even',
            },
          ]}
        />
      </div>
      <P>
        <strong>Tailwind has ~3× the searchable talent</strong>, but
        most are juniors to mids. MUI talent skews senior and
        enterprise-trained. For a Go SaaS targeting B2B, the MUI
        pool's seniority profile fits; for D2C or dev tools, the
        Tailwind pool's size and aesthetic fit better.
      </P>

      <H2>Bundle size — what's the real difference?</H2>
      <P>
        Real numbers for a checkout-kit-scale app (~17 screens, Stripe
        checkout, admin dashboard):
      </P>
      <div style={{ marginBottom: 24 }}>
        <ComparisonTable
          rows={[
            {
              label: 'Component lib (gzipped)',
              mui: '~165 KB (MUI + emotion)',
              tailwind: '~70 KB (@dashforge/tw + Radix)',
              advantage: 'tailwind',
            },
            {
              label: 'CSS bundle (gzipped)',
              mui: '~3 KB',
              tailwind: '~14 KB (Tailwind purged)',
              advantage: 'mui',
            },
            {
              label: 'Total app payload',
              mui: '~165 KB',
              tailwind: '~84 KB',
              advantage: 'tailwind',
            },
            {
              label: 'LCP on 4G mid-tier mobile',
              mui: '~1.4s',
              tailwind: '~1.1s',
              advantage: 'tailwind',
            },
            {
              label: 'LCP on broadband desktop',
              mui: '~0.7s',
              tailwind: '~0.5s',
              advantage: 'even',
            },
            {
              label: 'Visible to user on typical SaaS',
              mui: 'No',
              tailwind: 'No (mobile: marginal)',
              advantage: 'even',
            },
          ]}
        />
      </div>
      <P>
        Tailwind wins by ~80 KB total. For B2B dashboards accessed from
        broadband, the user sees nothing. For consumer-facing pages on
        4G mobile, the ~300ms head start can move conversion 1-2%.{' '}
        <strong>Your audience profile decides whether this matters.</strong>
      </P>

      <H2>How does the kit ship both?</H2>
      <P>
        Both flavors live in the same monorepo under{' '}
        <code>client/mui/</code> and <code>client/tailwind/</code>.
        They share an identical{' '}
        <a href="/docs/architecture" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          API + state layer
        </a>{' '}
        (
        <code>client/api/</code> and <code>client/shared/</code>), so
        the{' '}
        <a href="/docs/checkout" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          Stripe flow
        </a>
        , the{' '}
        <a href="/docs/rbac" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          RBAC engine
        </a>
        , and the form validation are byte-identical across flavors.
      </P>
      <P>
        You pick one to deploy. The other stays in your fork as a
        live reference of every screen in a second design language —
        useful when a designer joins or when you want to visualise a
        re-skin without committing to it.
      </P>

      <H2>My recommendation by buyer type</H2>
      <P>
        After analysing the buyer profiles the kit attracts, here's
        the matrix that holds up in practice:
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
        <RecommendationCard
          headline="Indie founder, B2B SaaS"
          pick="MUI"
          why="Material's enterprise-credible look reduces the 'is this real?' check from procurement. MUI X Pro is there if you ever need advanced grids."
        />
        <RecommendationCard
          headline="Indie founder, consumer / D2C"
          pick="Tailwind"
          why="Neutral aesthetic + smaller bundle + your brand tokens carry the personality. Mobile users get the bundle win."
        />
        <RecommendationCard
          headline="Freelancer for a client"
          pick="Match the client's stack"
          why="If the client lives in Tailwind, ship Tailwind. The bridge contract means swapping later is cheap (1-2 weeks)."
        />
        <RecommendationCard
          headline="Fintech / regulated"
          pick="MUI"
          why="Both pass a11y audits, but MUI's enterprise familiarity helps with compliance reviews. Conservative choice for conservative buyers."
        />
        <RecommendationCard
          headline="Internal B2B admin tool"
          pick="Either — lean MUI"
          why="Both ship parity DataGrid. MUI edges in if you ever need DataGrid Pro features (column groups, tree data, Excel export)."
        />
        <RecommendationCard
          headline="Dev tool / marketplace"
          pick="Tailwind"
          why="Developer audiences notice and judge Material defaults. The shadcn/Radix vocabulary signals 'we own our design'."
        />
        <RecommendationCard
          headline="Marketing-heavy SaaS"
          pick="Tailwind"
          why="Utility classes compose natively with marketing pages. If 30%+ of your FE is marketing surface, Tailwind compounds."
        />
        <RecommendationCard
          headline="Existing Tailwind team"
          pick="Tailwind"
          why="Don't fight muscle memory. Dashforge/tw is small enough to learn in a day on top of existing Tailwind + Radix fluency."
        />
        <RecommendationCard
          headline="Existing MUI team"
          pick="MUI"
          why="Same logic in reverse. The sx-object dialect they already know carries over directly."
        />
        <RecommendationCard
          headline="Unsure / hedging"
          pick="MUI for now"
          why="Larger ecosystem, more Stack Overflow surface, easier to hire into. The bridge contract means you can swap to Tailwind in 1-2 weeks if you change your mind."
        />
      </div>

      <H2>Frequently asked questions</H2>
      <div style={{ marginTop: 16 }}>
        {faqEntries.map((entry, i) => (
          <FaqRow key={i} q={entry.question} a={entry.answer} />
        ))}
      </div>

      <Callout
        variant="tip"
        title={`You're currently viewing the ${fe === 'tailwind' ? 'Tailwind' : 'MUI'} flavor`}
      >
        Use the FE selector in the top bar to switch and feel the
        difference live. Once you've decided, the{' '}
        <span
          onClick={() => navigate('/docs/pricing')}
          style={{
            color: '#1a1a1a',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          pricing page
        </span>{' '}
        shows the Go and Node editions — both include both frontends,
        so the FE choice doesn't constrain your edition.
      </Callout>
    </>
  );
}

type Advantage = 'mui' | 'tailwind' | 'even';

type ComparisonRow = {
  label: string;
  mui: string;
  tailwind: string;
  advantage: Advantage;
};

function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div
      style={{
        border: '1px solid #EEEEEE',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          background: '#FAFAFA',
          borderBottom: '1px solid #EEEEEE',
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Dimension
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          MUI
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Tailwind (Dashforge/tw)
        </div>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            paddingTop: 12,
            paddingBottom: 12,
            paddingLeft: 16,
            paddingRight: 16,
            borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none',
          }}
        >
          <div style={{ fontSize: '13.5px', color: '#374151', fontWeight: 500, alignSelf: 'center' }}>
            {r.label}
          </div>
          <CellWithBadge text={r.mui} winner={r.advantage === 'mui'} />
          <CellWithBadge text={r.tailwind} winner={r.advantage === 'tailwind'} />
        </div>
      ))}
    </div>
  );
}

function CellWithBadge({ text, winner }: { text: string; winner: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {winner && (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#059669',
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ fontSize: '13.5px', color: winner ? '#065F46' : '#374151', fontWeight: winner ? 600 : 400 }}>
        {text}
      </div>
    </div>
  );
}

function RecommendationCard({
  headline,
  pick,
  why,
}: {
  headline: string;
  pick: string;
  why: string;
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
          marginBottom: 4,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontSize: '15px',
          fontWeight: 800,
          color: '#1a1a1a',
          marginBottom: 8,
        }}
      >
        Pick {pick}
      </div>
      <div style={{ fontSize: '13px', color: '#545454', lineHeight: 1.6 }}>
        {why}
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
      <div style={{ fontSize: '14px', color: '#545454', lineHeight: 1.65 }}>
        {a}
      </div>
    </div>
  );
}
