import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';

const sections: Array<{
  title: string;
  items: string[];
}> = [
  {
    title: 'Environment',
    items: [
      'Switch STRIPE_SECRET_KEY / VITE_STRIPE_PK to live keys (pk_live_… / sk_live_…)',
      'STRIPE_WEBHOOK_SECRET is the production endpoint secret (not the CLI dev one)',
      'JWT_SECRET is at least 32 random bytes, distinct from dev',
      'MONGODB_URI points at a managed cluster with TLS',
      'APP_ENV=production (Gin sets release mode, error responses lose stack traces)',
    ],
  },
  {
    title: 'CORS + Origin',
    items: [
      'Lock CORS allowed origins to the production storefront domain',
      'Set Vite VITE_APP_API_HOST to the production API base URL',
      'Topbar absolute links use relative paths — no host hardcoded',
    ],
  },
  {
    title: 'Storage (S3)',
    items: [
      'Bucket is private; CDN distribution serves with signed URLs OR the bucket is public-read with no listing',
      'S3_CDN_BASE points at the CDN, NOT the raw S3 endpoint (HTTPS, custom domain, caching)',
      'Lifecycle rule: orphan janitor (recommended) — remove keys older than X days with no DB reference',
      'IAM credentials have ONLY the s3:PutObject + s3:DeleteObject on the kit prefix',
    ],
  },
  {
    title: 'Database',
    items: [
      'Indexes ensured at boot (db.EnsureIndexes() — runs in main.go)',
      'Backup policy in place (managed cluster handles this)',
      'Soft delete strategy for users / customers reviewed — V1 marks deleted, keeps the doc',
    ],
  },
  {
    title: 'Webhook',
    items: [
      'Stripe production endpoint configured at https://api.yourdomain/v1/webhooks/stripe',
      'STRIPE_WEBHOOK_SECRET matches the dashboard endpoint signing secret',
      'Webhook handler is BEHIND a body-size limit but ABOVE 1 MiB (Stripe payloads can be large)',
      'Idempotency collection has a TTL or growth limit',
    ],
  },
  {
    title: 'Observability',
    items: [
      'Structured logging on (request id middleware already ships)',
      'A monitoring agent attached (Datadog / NewRelic / Pino → Loki — buyer\'s choice)',
      'Stripe Radar reviewed for the production volume',
      'Alerting on /v1/webhooks/stripe non-200 (the kit shouldn\'t return non-200 except on signature mismatch)',
    ],
  },
  {
    title: 'Security',
    items: [
      'Permissions-Policy + X-Frame-Options + X-Content-Type-Options ALL set (already shipped)',
      'JWT expiry reviewed (V1 default: 24h; bump or lower per your security posture)',
      'Rate limit on /auth/* endpoints (Cloudflare / nginx — kit doesn\'t ship one)',
      'Admin signup is OUT — admin accounts seed-only or invite-only (kit doesn\'t expose a public /admin/signup)',
    ],
  },
];

export function ProductionChecklist() {
  return (
    <>
      <PageTitle
        eyebrow="Deployment"
        title="Production Checklist"
        description="Walk it once before going live, then once after. Each bullet is a thing the kit either does for you or hands off to your infra."
      />

      <Callout variant="warning" title="The kit ships in TEST mode by default">
        STRIPE_SECRET_KEY / pk are test (<code>sk_test_…</code>,{' '}
        <code>pk_test_…</code>) in the .env.example. Live keys must be
        swapped explicitly — production deploys never use test keys
        even briefly.
      </Callout>

      {sections.map((s) => (
        <section key={s.title}>
          <H2>{s.title}</H2>
          <P>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {s.items.map((item) => (
                <li
                  key={item}
                  style={{
                    fontSize: '14.5px',
                    color: '#374151',
                    lineHeight: 1.7,
                    marginBottom: 6,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </P>
        </section>
      ))}

      <H2>Stripe live mode dry-run</H2>
      <P>
        Before flipping DNS to the production app, run one real
        transaction with a live card on a staging deploy that uses
        the production Stripe keys + a sandbox bucket. The webhook
        round-trip from production Stripe to your staging BE
        confirms the signature secret and HTTPS path before
        customers touch it.
      </P>
      <CodeBlock
        language="bash"
        code={`# Staging .env (production keys, staging URLs)
APP_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...  # from the staging endpoint, NOT prod`}
      />
    </>
  );
}
