import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function Deployment() {
  const { be } = useDocs();
  const isNode = be === 'node';

  const beDir = isNode ? 'server-node' : 'server';
  const buildCmd = isNode
    ? 'npm install --omit=dev'
    : 'go build -o ./bin/checkout-kit ./cmd/api';
  const runCmd = isNode ? 'npm run start' : './bin/checkout-kit';

  return (
    <>
      <PageTitle
        eyebrow="Deployment"
        title="Deploy to DigitalOcean"
        description="Two paths: App Platform (managed PaaS, zero sysadmin) or a Droplet (VPS, full control). Both work with the Go and Node backends."
      />

      <H2>Prerequisites</H2>
      <P>
        Before deploying, have these ready regardless of which path you
        choose:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
          <li>
            <strong>MongoDB</strong> — DO Managed MongoDB or MongoDB
            Atlas. The kit works with any URI that starts with{' '}
            <code>mongodb+srv://</code> or <code>mongodb://</code>.
          </li>
          <li>
            <strong>DO Spaces</strong> — S3-compatible bucket for
            product images. Create a Space, note the endpoint (e.g.{' '}
            <code>fra1.digitaloceanspaces.com</code>), and generate an
            access key pair under <em>API → Spaces Keys</em>.
          </li>
          <li>
            <strong>Stripe live keys</strong> — <code>sk_live_…</code>{' '}
            and <code>pk_live_…</code>. The webhook secret comes after
            you register the endpoint (step at the end of this page).
          </li>
          <li>
            <strong>Domain + DNS</strong> — two A records: one for the
            API (<code>api.yourdomain.com</code>), one for the storefront
            (<code>yourdomain.com</code>).
          </li>
        </ul>
      </P>

      {/* ── OPTION A: App Platform ─────────────────────────────────── */}
      <H2>Option A — App Platform</H2>
      <P>
        App Platform auto-deploys from GitHub, manages TLS, and scales
        without touching a server. The checkout-kit maps to three
        components in a single DO App:
      </P>
      <CodeBlock
        filename="DO App components"
        language="bash"
        code={`1. Service     — ${beDir}/         (${isNode ? 'Node' : 'Go'} API, HTTP port 3333)
2. Static Site  — client/mui/      (MUI storefront, Vite build → dist/)
   OR
2. Static Site  — client/tailwind/ (Tailwind storefront, Vite build → dist/)`}
      />

      <P>
        In the App Platform UI (<em>Create App → GitHub</em>), set the
        source root to the repo root and configure each component:
      </P>
      <CodeBlock
        filename={`Service — ${beDir}/`}
        language="bash"
        code={isNode
          ? `Source directory: server-node
Build command:    npm install --omit=dev
Run command:      npm run start
HTTP port:        3333`
          : `Source directory: server
Build command:    go build -o checkout-kit ./cmd/api
Run command:      ./checkout-kit
HTTP port:        3333`}
      />
      <CodeBlock
        filename="Static Site — client/mui/ (or client/tailwind/)"
        language="bash"
        code={`Source directory: client/mui          # or client/tailwind
Build command:    npm install && npm run build
Output dir:       dist
Routes:           /* → /index.html   (SPA catch-all)`}
      />

      <P>
        Add environment variables under <em>Component → Environment
        Variables</em>. Mark secrets as <em>encrypted</em>:
      </P>
      <CodeBlock
        filename="Service env vars"
        language="bash"
        code={`# Required — mark as encrypted
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<32+ random bytes>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...   # set after registering the endpoint
S3_ACCESS_KEY=<DO Spaces key>
S3_SECRET_KEY=<DO Spaces secret>

# Required — plain
APP_ENV=production
PORT=3333
CORS_ORIGINS=https://yourdomain.com
S3_BUCKET=<spaces-bucket-name>
S3_REGION=<fra1 or your region>
S3_ENDPOINT=https://<region>.digitaloceanspaces.com
S3_CDN_BASE=https://<bucket>.<region>.cdn.digitaloceanspaces.com`}
      />
      <CodeBlock
        filename="Static Site env vars (build-time)"
        language="bash"
        code={`VITE_APP_API_HOST=https://api.yourdomain.com
VITE_STRIPE_PK=pk_live_...
VITE_PROVIDER=live`}
      />

      <Callout variant="tip" title="App Platform injects PORT automatically">
        DO App Platform sets <code>PORT</code> in the runtime
        environment — the kit reads it and overrides the default 3333.
        You don't need to set <code>PORT</code> explicitly for the
        service component.
      </Callout>

      {/* ── OPTION B: Droplet ─────────────────────────────────────── */}
      <H2>Option B — Droplet (VPS)</H2>
      <P>
        A $12/month Droplet (2 GB RAM, Ubuntu 22.04 LTS) is enough for
        the full kit. The setup is: build the API, configure nginx as a
        reverse proxy, get TLS from Let's Encrypt, enable UFW.
      </P>

      <H2>1. Provision the Droplet</H2>
      <CodeBlock
        language="bash"
        code={`# After SSH-ing in as root
adduser deploy
usermod -aG sudo deploy
# Copy your SSH key to deploy, then:
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable`}
      />

      <H2>2. Install runtime</H2>
      <CodeBlock
        language="bash"
        code={isNode
          ? `# Node 22 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 for process management
sudo npm install -g pm2`
          : `# Go 1.23+ (check golang.org for latest)
wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.profile
source ~/.profile`}
      />

      <H2>3. Deploy the API</H2>
      <CodeBlock
        language="bash"
        code={`# As deploy user
git clone https://github.com/YOUR_ORG/checkout-kit.git /opt/checkout-kit
cd /opt/checkout-kit/${beDir}

# Copy and fill .env
cp .env.example .env
nano .env   # set all production values

# Build
${buildCmd}`}
      />

      <H2>4. Process manager</H2>
      {isNode ? (
        <CodeBlock
          filename="PM2 startup"
          language="bash"
          code={`cd /opt/checkout-kit/server-node
pm2 start npm --name "checkout-kit" -- run start
pm2 save
pm2 startup   # follow the printed sudo command`}
        />
      ) : (
        <CodeBlock
          filename="/etc/systemd/system/checkout-kit.service"
          language="ini"
          code={`[Unit]
Description=checkout-kit API (Go)
After=network.target

[Service]
User=deploy
WorkingDirectory=/opt/checkout-kit/server
ExecStart=/opt/checkout-kit/server/bin/checkout-kit
EnvironmentFile=/opt/checkout-kit/server/.env
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target`}
        />
      )}
      {!isNode && (
        <CodeBlock
          language="bash"
          code={`sudo systemctl enable checkout-kit
sudo systemctl start checkout-kit
sudo systemctl status checkout-kit`}
        />
      )}

      <H2>5. Build + serve the FE</H2>
      <CodeBlock
        language="bash"
        code={`cd /opt/checkout-kit/client/mui   # or client/tailwind
cp .env.example .env.production
# Set VITE_APP_API_HOST, VITE_STRIPE_PK, VITE_PROVIDER=live
npm install && npm run build
# → dist/ is the static output`}
      />

      <H2>6. nginx</H2>
      <P>
        Two server blocks: one for the API (<code>api.yourdomain.com</code>
        → localhost:3333), one for the storefront (
        <code>yourdomain.com</code> → <code>dist/</code>).
      </P>
      <CodeBlock
        filename="/etc/nginx/sites-available/checkout-kit"
        language="nginx"
        code={`# API
server {
  listen 80;
  server_name api.yourdomain.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  server_name api.yourdomain.com;

  ssl_certificate     /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

  client_max_body_size 20M;   # cover image uploads

  location / {
    proxy_pass         http://localhost:3333;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
  }
}

# Storefront
server {
  listen 443 ssl;
  server_name yourdomain.com;

  ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  root /opt/checkout-kit/client/mui/dist;   # or client/tailwind/dist
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;   # SPA fallback
  }
}`}
      />
      <CodeBlock
        language="bash"
        code={`sudo ln -s /etc/nginx/sites-available/checkout-kit /etc/nginx/sites-enabled/
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
sudo nginx -t && sudo systemctl reload nginx`}
      />

      {/* ── Stripe webhook ────────────────────────────────────────── */}
      <H2>Register the Stripe webhook</H2>
      <P>
        After the API is live and reachable over HTTPS, register the
        production endpoint in the Stripe Dashboard:
      </P>
      <CodeBlock
        language="bash"
        code={`Endpoint URL:  https://api.yourdomain.com/v1/webhooks/stripe
Events to send:
  payment_intent.succeeded
  payment_intent.payment_failed
  charge.refunded`}
      />
      <P>
        Copy the signing secret (<code>whsec_…</code>) from the
        endpoint detail page and set it as{' '}
        <code>STRIPE_WEBHOOK_SECRET</code> in your environment.
        Restart the service after updating the env.
      </P>

      <Callout variant="warning" title="DO Spaces CDN URL vs origin URL">
        Set <code>S3_CDN_BASE</code> to the <strong>CDN</strong> URL (
        <code>https://bucket.fra1.cdn.digitaloceanspaces.com</code>),
        not the origin endpoint. The kit stores the CDN URL in the DB,
        so switching from origin to CDN later requires a data migration.
        Get it right on first deploy.
      </Callout>

      <Callout variant="tip" title="Zero-downtime redeploy on Droplet">
        For Go: build the new binary to a temp path, then{' '}
        <code>sudo systemctl restart checkout-kit</code> — the old
        binary serves until the new process is up. For Node:{' '}
        <code>pm2 reload checkout-kit</code> does a graceful rolling
        restart with zero dropped connections.
      </Callout>

      <H2>Common pitfalls</H2>

      <Callout variant="warning" title="Build the frontend locally, not on the Droplet">
        A 1 GB Droplet does not have enough RAM to run <code>npm run build</code> — Vite
        will hang indefinitely bundling MUI + DashForge. Build on your development
        machine, commit the <code>dist/</code> folder, and pull it on the server.
        <br /><br />
        <code>client/mui/dist/</code> is in <code>.gitignore</code> — force-add it:
        <br />
        <code>git add -f client/mui/dist/ &amp;&amp; git commit -m "deploy: dist"</code>
      </Callout>

      <Callout variant="warning" title="VITE_APP_API_HOST is baked in at build time">
        Vite replaces <code>import.meta.env.VITE_*</code> variables at build time, not
        at runtime. Changing them on the server has no effect. Set the correct production
        values in <code>client/mui/.env.production</code> <strong>before</strong> running{' '}
        <code>npm run build</code>, then commit and redeploy the dist.
        <br /><br />
        Minimum required:
        <br />
        <code>VITE_APP_API_HOST=https://your-domain.com</code><br />
        <code>VITE_STRIPE_PK=pk_live_...</code><br />
        <code>VITE_PROVIDER=live</code>
      </Callout>

      <Callout variant="warning" title="Restart the service after every .env change">
        The Go (and Node) process reads <code>.env</code> once at startup. After editing
        any server-side variable — <code>CORS_ORIGINS</code>, <code>STRIPE_SECRET_KEY</code>,{' '}
        <code>PORT</code>, etc. — always run:
        <br />
        <code>sudo systemctl restart checkout-kit</code>
      </Callout>

      <Callout variant="warning" title="PORT must match nginx proxy_pass">
        The <code>PORT</code> in <code>server/.env</code> and the{' '}
        <code>proxy_pass http://localhost:PORT</code> in your nginx config must be
        identical. If they differ, nginx returns a 502 and the API appears unreachable.
        Verify with:
        <br />
        <code>grep PORT server/.env</code><br />
        <code>grep proxy_pass /etc/nginx/sites-available/checkout-kit</code>
      </Callout>
    </>
  );
}
