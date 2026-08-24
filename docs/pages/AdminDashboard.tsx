import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function AdminDashboard() {
  const { fe } = useDocs();
  if (fe === 'tailwind') {
    return (
      <>
        <PageTitle
          eyebrow="Admin"
          title="Dashboard"
          description="Sales chart + top products + recent activity, all hydrated from one /v1/admin/orders fetch — client-side reduce. 1:1 port of the MUI flavor."
        />

        <H2>Why client-side aggregation</H2>
        <P>
          The dashboard pulls the last N orders (default{' '}
          <code>perPage=200</code>) and computes everything in one{' '}
          <code>useMemo</code>: revenue, AOV, last-7-day buckets, top
          products by units sold, recent activity feed. Zero new BE
          endpoint for V1.
        </P>
        <P>
          Once a buyer's catalog crosses ~5,000 orders the FE
          aggregation will be too heavy — that's the natural moment to
          promote <code>/v1/admin/stats?period=7d</code> as a real Mongo
          aggregation pipeline. Until then, one fetch beats one endpoint.
        </P>

        <H2>The seven-day chart</H2>
        <P>
          A <code>recharts</code> AreaChart in money-green with a soft
          gradient fill. recharts requires raw color values (not Tailwind
          classes), so the chart reads colors from{' '}
          <code>useKitTokens()</code> — the JS token hook that returns
          the active light/dark palette.
        </P>
        <CodeBlock
          filename="client/tailwind/src/features/admin/dashboard/AdminDashboardPage.tsx"
          language="tsx"
          code={`const t = useKitTokens(); // raw hex values for recharts

<AreaChart data={stats.last7Days}>
  <defs>
    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor={t.colors.money} stopOpacity={0.35} />
      <stop offset="100%" stopColor={t.colors.money} stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke={t.colors.borderSubtle} vertical={false} />
  <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} />
  <YAxis tickLine={false} axisLine={false}
    tickFormatter={(v) => v >= 1000 ? \`\${Math.round(v / 1000)}k\` : v} />
  <Area type="monotone" dataKey="revenueMajor"
    stroke={t.colors.money} strokeWidth={2.5}
    fill="url(#salesGradient)" />
</AreaChart>`}
        />

        <H2>Empty state</H2>
        <P>
          A brand-new DB with zero orders gets a graceful "Your dashboard
          wakes up the moment a customer completes the first checkout."
          — the chart never renders as a 0-line vacuum.
        </P>

        <Callout variant="tip" title="Activity bell uses the same source">
          The topbar bell polls <code>/v1/admin/orders?perPage=7</code>{' '}
          every 30 seconds. New orders bump the badge count (compared
          against a localStorage <code>lastSeenAt</code>) and the
          dropdown surfaces the seven latest events with status icons.
        </Callout>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Admin"
        title="Dashboard"
        description="Sales chart + top products + recent activity, all hydrated from one /v1/admin/orders fetch — client-side reduce."
      />

      <H2>Why client-side aggregation</H2>
      <P>
        The dashboard pulls the last N orders (default{' '}
        <code>perPage=200</code>) and computes everything in one
        <code> useMemo</code>: revenue, AOV, last-7-day buckets, top
        products by units sold, recent activity feed. Zero new BE
        endpoint for V1.
      </P>
      <P>
        Once a buyer's catalog crosses ~5,000 orders the FE
        aggregation will be too heavy — that's the natural moment to
        promote{' '}<code>/v1/admin/stats?period=7d</code>{' '}as a real Mongo
        aggregation pipeline. Until then, one fetch beats one endpoint.
      </P>

      <H2>The seven-day chart</H2>
      <P>
        A <code>recharts</code> AreaChart in money-green with a soft
        gradient fill. The grid uses subtle dashed lines so the
        dashboard reads premium without screaming "spreadsheet".
      </P>
      <CodeBlock
        filename="client/mui/src/features/admin/dashboard/AdminDashboardPage.tsx"
        language="tsx"
        code={`<AreaChart data={stats.last7Days}>
  <defs>
    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor={theme.tokens.colors.money} stopOpacity={0.35}/>
      <stop offset="100%" stopColor={theme.tokens.colors.money} stopOpacity={0}/>
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke={theme.tokens.colors.borderSubtle} vertical={false}/>
  <XAxis dataKey="dayLabel"  tickLine={false} axisLine={false}/>
  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? \`\${Math.round(v/1000)}k\` : v}/>
  <Area type="monotone" dataKey="revenueMajor"
        stroke={theme.tokens.colors.money} strokeWidth={2.5}
        fill="url(#salesGradient)" />
</AreaChart>`}
      />

      <H2>Empty state</H2>
      <P>
        A brand-new DB with zero orders gets a graceful "Your dashboard
        wakes up the moment a customer completes the first checkout."
        — the chart never renders as a 0-line vacuum.
      </P>

      <Callout variant="tip" title="Activity bell uses the same source">
        The topbar bell polls{' '}<code>/v1/admin/orders?perPage=7</code>{' '}
        every 30 seconds. New orders bump the badge count (compared
        against a localStorage{' '}<code>lastSeenAt</code>) and the
        dropdown surfaces the seven latest events with status icons.
      </Callout>
    </>
  );
}
