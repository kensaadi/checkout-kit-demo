import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { StepList } from '../components/StepList';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function Installation() {
  const { be } = useDocs();
  const isNode = be === 'node';

  return (
    <>
      <PageTitle
        eyebrow="Getting Started"
        title="Installation"
        description="Clone the kit, install dependencies, configure env vars, seed the database, run. Five steps."
      />

      <H2>Prerequisites</H2>
      {isNode ? (
        <P>
          You'll need a recent Node.js (≥ 20), a MongoDB instance running
          locally (or a connection string to a remote one), and the
          Stripe CLI for local webhook forwarding.
        </P>
      ) : (
        <P>
          You'll need a recent Node.js (≥ 20), Go (≥ 1.24), a MongoDB
          instance running locally (or a connection string to a remote
          one), and the Stripe CLI for local webhook forwarding.
        </P>
      )}

      <StepList
        steps={[
          {
            title: 'Clone and install client deps',
            description: (
              <CodeBlock
                code={`git clone <kit-repo> checkout-kit
cd checkout-kit/client
npm install`}
                language="bash"
              />
            ),
          },
          {
            title: 'Configure environment variables',
            description: (
              <>
                <P>
                  Two env files: one for the BE ({isNode ? 'Node' : 'Go'}),
                  one for the FE (Vite).
                </P>
                <CodeBlock
                  code={`cp server/.env.example server/.env
cp client/mui/.env.example client/mui/.env`}
                  language="bash"
                />
                <P>Open each and fill in the values:</P>
                <CodeBlock
                  filename="server/.env"
                  language="bash"
                  code={
                    isNode
                      ? `NODE_ENV=development
PORT=3333
DEMO_MODE=false
MONGODB_URI=mongodb://localhost:27017/checkout-kit
JWT_SECRET=<random 32+ chars>
CORS_ORIGINS=http://localhost:5173

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

S3_KEY=...
S3_SECRET=...
S3_REGION=us-east-1
S3_BUCKET=checkout-kit
S3_CDN_BASE=https://cdn.example.com
S3_ENDPOINT=`
                      : `APP_ENV=development
PORT=3333
DEMO_MODE=false
MONGODB_URI=mongodb://localhost:27017/checkout-kit
JWT_SECRET=<random 32+ chars>
CORS_ORIGINS=http://localhost:5173

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

S3_KEY=...
S3_SECRET=...
S3_REGION=us-east-1
S3_BUCKET=checkout-kit
S3_CDN_BASE=https://cdn.example.com
S3_ENDPOINT=`
                  }
                />
                <CodeBlock
                  filename="client/mui/.env"
                  language="bash"
                  code={`VITE_APP_API_HOST=http://localhost:3333
VITE_STRIPE_PK=pk_test_...
VITE_PROVIDER=live`}
                />
              </>
            ),
          },
          {
            title: 'Install server deps + seed the database',
            description: (
              <>
                <P>
                  The seed creates seeded users (admin, sales),
                  customers, products, the RBAC policy, and 40 historical
                  orders so the admin dashboard opens with realistic
                  data.
                </P>
                {isNode ? (
                  <CodeBlock
                    code={`cd server
npm install
npm run seed`}
                    language="bash"
                  />
                ) : (
                  <CodeBlock
                    code={`cd server
go run ./cmd/seed`}
                    language="bash"
                  />
                )}
              </>
            ),
          },
          {
            title: 'Run the backend',
            description: isNode ? (
              <CodeBlock
                code={`npm run dev
# → listening: http://localhost:3333`}
                language="bash"
              />
            ) : (
              <CodeBlock
                code={`go run ./cmd/api
# → listening: http://localhost:3333`}
                language="bash"
              />
            ),
          },
          {
            title: 'Run the frontend',
            description: (
              <CodeBlock
                code={`cd client/mui   # or client/tailwind
npm run dev
# → http://localhost:5173`}
                language="bash"
              />
            ),
          },
          {
            title: 'Forward Stripe webhooks (locally)',
            description: (
              <>
                <P>
                  For the checkout to flip orders from
                  {' '}<code>pending_payment</code>{' '}to{' '}
                  <code>paid</code>, Stripe needs to deliver the webhook
                  to your local BE. The CLI does that:
                </P>
                <CodeBlock
                  code={`stripe listen --forward-to localhost:3333/v1/webhooks/stripe`}
                  language="bash"
                />
                <P>
                  The CLI prints a{' '}<code>whsec_...</code>{' '}value — paste
                  it into {' '}<code>STRIPE_WEBHOOK_SECRET</code>{' '}in
                  {' '}<code>server/.env</code>{' '}and restart the BE.
                </P>
              </>
            ),
          },
        ]}
      />

      <Callout variant="tip" title="Want to work without Stripe / Mongo?">
        Set <code>VITE_PROVIDER=mock</code> in the FE env and the
        entire client runs against in-memory mocks. Useful for UI work,
        demos in airplane mode, and CI runs.
      </Callout>

      <Callout variant="warning" title="Webhook secret matters">
        If the BE rejects webhooks with{' '}
        <code>signature mismatch</code>, the{' '}
        <code>STRIPE_WEBHOOK_SECRET</code>{' '}in server/.env doesn't
        match what the Stripe CLI is using. Restart{' '}
        <code>stripe listen</code> and copy the new secret.
      </Callout>
    </>
  );
}
