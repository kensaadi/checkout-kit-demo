import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { StepList } from '../components/StepList';
import { H2, P, PageTitle } from '../components/PageTitle';

/**
 * Bruno Collection landing page.
 *
 * Bruno (https://www.usebruno.com) is the API client the kit ships
 * its endpoint definitions in. The repo includes 43 .bru files
 * covering every endpoint with happy-path + negative cases.
 *
 * This page introduces the collection. Per-endpoint deep-dives
 * land in a future docs round.
 */
export function BrunoCollection() {
  return (
    <>
      <PageTitle
        eyebrow="API Reference"
        title="Bruno Collection"
        description="The kit ships with a ready-to-import Bruno collection — 43 files covering every endpoint with happy-path AND negative test cases. Clone, open, run."
      />

      <Callout variant="info" title="Why Bruno (and not Postman)">
        Bruno keeps the collection as plain{' '}<code>.bru</code>{' '}
        files on disk — git-friendly, versionable, reviewable in
        PRs. No cloud account, no sync, no proprietary export
        format. Free and open-source.
      </Callout>

      <H2>What's inside</H2>
      <P>
        Every endpoint the BE exposes is documented in the collection
        — request shape, auth state, expected response. Negative
        cases live next to the happy ones so reviewers can verify
        the BE refuses what it should refuse.
      </P>

      <CodeBlock
        language="bash"
        filename="api/checkout-kit/"
        code={`api/checkout-kit/
├── bruno.json                                         # collection meta
├── environments/
│   └── local.bru                                      # baseUrl, tokens, …
├── fixtures/
│   └── test.png                                       # multipart upload sample
├── Ping.bru                                           # /v1/ping
├── Health.bru                                         # /health
├── Auth/
│   ├── Staff Login.bru
│   ├── Sales Login.bru
│   └── Customer Login.bru
├── Me/
│   ├── Staff Me.bru
│   ├── Customer Me.bru
│   ├── Customer Update Profile.bru
│   ├── Customer Change Password.bru
│   ├── Staff Me as Customer (403).bru                 # ← negative
│   └── Customer Me as Staff (403).bru                 # ← negative
├── Policies/
│   └── Get Policy.bru
├── Products/
│   ├── List.bru
│   ├── Get by Slug.bru
│   └── Get by Slug (404).bru                          # ← negative
├── Admin/
│   ├── Products/
│   │   ├── List, Get, Create, Update, Delete
│   │   ├── Upload Cover / Gallery (multipart)
│   │   ├── Remove Gallery Image
│   │   └── Create Duplicate Slug (409).bru            # ← negative
│   └── Orders/
│       ├── List, Get
│       └── Get Other Customer Order (404).bru         # ← negative (admin)
├── Cart/
│   ├── Get, Add Item, Update Item, Remove Item, Clear
│   └── Add Item Currency Mismatch (422).bru           # ← negative
├── Checkout/
│   ├── List Payment Methods, Create Setup Intent, Confirm Payment
├── Orders/
│   ├── List My Orders, Get My Order
│   └── Get Other Customer Order (404).bru             # ← negative
└── Webhooks/
    └── Stripe Webhook (Signature Required).bru        # signed-call demo`}
      />

      <P>
        Totals: <strong>33 endpoint files</strong> for the happy
        paths, <strong>6 negative-case files</strong> demonstrating
        the BE's refusal semantics (403 cross-role,{' '}
        404 no-info-leak, 409 duplicate, 422 invalid input),{' '}
        <strong>1 Stripe webhook stub</strong>,{' '}
        <strong>1 environment file</strong>, plus a multipart{' '}
        <code>fixtures/test.png</code>.
      </P>

      <H2>Install Bruno</H2>
      <P>
        Bruno ships as a desktop app for macOS, Linux, Windows, and
        as a CLI (<code>npm i -g @usebruno/cli</code>) for CI runs.
        Download from <code>usebruno.com</code> or your package
        manager.
      </P>
      <CodeBlock
        language="bash"
        code={`# macOS
brew install --cask bruno

# Linux / Windows
# → grab the installer at usebruno.com/downloads`}
      />

      <H2>Run the collection</H2>
      <StepList
        steps={[
          {
            title: 'Open Bruno → File → Open Collection',
            description: (
              <P>
                Point it at{' '}<code>checkout-kit/api/checkout-kit/</code>
                . Bruno reads{' '}<code>bruno.json</code>{' '}and loads
                every <code>.bru</code> file as a request.
              </P>
            ),
          },
          {
            title: 'Pick the "local" environment',
            description: (
              <>
                <P>
                  The top-right environment selector controls{' '}
                  <code>{`{{baseUrl}}`}</code>,{' '}
                  <code>{`{{customerToken}}`}</code>,{' '}etc. The{' '}
                  <code>local</code> env is preconfigured for{' '}
                  <code>http://localhost:3333</code>.
                </P>
                <CodeBlock
                  filename="api/checkout-kit/environments/local.bru"
                  language="bash"
                  code={`vars {
  baseUrl: http://localhost:3333
  adminToken:    # paste after running "Staff Login"
  customerToken: # paste after running "Customer Login"
}`}
                />
              </>
            ),
          },
          {
            title: 'Run "Staff Login" / "Customer Login" first',
            description: (
              <P>
                The Auth folder produces JWTs. Copy each{' '}
                <code>token</code> value from the response and
                paste it into <code>adminToken</code> /{' '}
                <code>customerToken</code> in the env — the
                other requests pick it up via{' '}
                <code>Authorization: Bearer {`{{adminToken}}`}</code>.
              </P>
            ),
          },
          {
            title: 'Run any endpoint',
            description: (
              <P>
                Each <code>.bru</code> ships with a sample body
                that mirrors what the FE sends. Inspect or modify,
                send, read the response inline.
              </P>
            ),
          },
          {
            title: 'Negative cases',
            description: (
              <P>
                The files marked with a trailing parenthesis (
                <code>(403)</code>, <code>(404)</code>,{' '}
                <code>(409)</code>, <code>(422)</code>) deliberately
                trigger the BE's refusal semantics — useful to
                confirm the kit's error contract before shipping
                changes.
              </P>
            ),
          },
        ]}
      />

      <H2>CI usage</H2>
      <P>
        The Bruno CLI runs the same files in a pipeline:
      </P>
      <CodeBlock
        language="bash"
        code={`# Install
npm i -g @usebruno/cli

# Run the collection against your local BE
bru run api/checkout-kit --env local

# Output: pass/fail per request, exit code drives CI`}
      />
      <P>
        Add this as a stage in your CI to catch BE contract
        regressions before they hit prod.
      </P>

      <Callout variant="tip" title="Per-endpoint deep-dives coming">
        This page introduces the collection. A future docs round
        will document each Bruno file in detail — pre-conditions,
        expected response, headers to set — so the collection
        becomes the canonical API reference, not just a runnable
        index.
      </Callout>

      <H2>Where it lives in the repo</H2>
      <div
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: '8px',
          border: '1px solid #EEEEEE',
          background: '#FAFAFA',
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '13.5px',
            color: '#1a1a1a',
            lineHeight: 1.6,
          }}
        >
          checkout-kit/
          <br />
          └── api/
          <br />
          {'    '}└── checkout-kit/{' '}
          <span style={{ color: '#8A8A8A', fontFamily: 'inherit' }}>
            ← open this folder in Bruno
          </span>
        </div>
      </div>
    </>
  );
}
