import { useNavigate } from 'react-router-dom';
import { Callout } from '../components/Callout';
import { H2, P, PageTitle } from '../components/PageTitle';

export function License() {
  const navigate = useNavigate();

  return (
    <>
      <PageTitle
        eyebrow="Get the kit"
        title="License"
        description="Commercial source-available license. You build with it; you don't redistribute it. Full terms below."
      />

      <P style={{ color: '#8A8A8A', fontSize: '13px', marginTop: 0 }}>
        Last updated: June 2026
      </P>

      <Callout variant="info" title="Looking for prices?">
        Pricing tiers + what each one includes live on the{' '}
        <span
          onClick={() => navigate('/docs/pricing')}
          style={{
            color: '#1a1a1a',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Pricing page
        </span>
        . The selectors in the top bar decide which edition (Go or
        Node) you're viewing.
      </Callout>

      <H2>Definitions</H2>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
          <li>
            <strong>Product ("checkout-kit")</strong> — the source
            code, documentation, and all associated files delivered
            to you after purchase.
          </li>
          <li>
            <strong>End Product</strong> — a single software
            application built by you (or your organisation) using the
            Product. An End Product is something your customers
            interact with; the Product itself is never the End Product.
          </li>
          <li>
            <strong>Developer</strong> — any individual who directly
            reads, modifies, or integrates the Product source code.
            Designers, QA, or DevOps personnel who only interact with
            the compiled output do not count as Developers.
          </li>
          <li>
            <strong>End User</strong> — a user of your End Product.
            End Users do not need a license.
          </li>
          <li>
            <strong>Client</strong> — a third party you build an End
            Product for under a service contract. One license covers
            one Client per permitted deployment.
          </li>
          <li>
            <strong>Author</strong> — Ken Saadi /
            dashforge-ui.com, the rights holder of checkout-kit.
          </li>
        </ul>
      </P>

      <H2>License grant by tier</H2>
      <P>
        On purchase of a valid tier, the Author grants you a
        non-exclusive, non-transferable, worldwide license to use,
        modify, and incorporate the Product into End Products,
        subject to the restrictions below.
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
          <li>
            <strong>Developer tier</strong> — 1 Developer, 1 End
            Product, 1 production deployment. The End Product may
            be a commercial application (including SaaS with paying
            End Users). White-label rights not included.
          </li>
          <li>
            <strong>Team tier</strong> — up to 5 Developers within
            one legal entity, 1 End Product, up to 3 production
            deployments. The End Product may be commercial.
            White-label rights not included.
          </li>
          <li>
            <strong>Extended tier</strong> — unlimited Developers
            within one legal entity, unlimited End Products,
            unlimited production deployments.{' '}
            <strong>White-label rights included</strong>: you may
            remove or replace all checkout-kit and dashforge-ui
            branding in your End Product.
          </li>
        </ul>
      </P>

      <H2>What you can do</H2>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
          <li>Build commercial End Products, including SaaS applications with paying End Users</li>
          <li>Modify the source freely for use within your End Product</li>
          <li>Combine the Product with your proprietary code</li>
          <li>Deploy the compiled End Product to your customers</li>
          <li>Use the Product for a single Client (one End Product per license)</li>
          <li>Remove or replace branding <em>(Extended tier only)</em></li>
        </ul>
      </P>

      <H2>What you cannot do</H2>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
          <li>
            <strong>Redistribute the source</strong> — you may not
            publish, sell, sublicense, or otherwise distribute the
            Product source code (original or modified) as a standalone
            kit, template, boilerplate, or starter.
          </li>
          <li>
            <strong>Public repositories</strong> — you may not push
            the Product source (or any substantial portion of it) to
            a public repository, including GitHub, GitLab, npm, or
            any package registry.
          </li>
          <li>
            <strong>Exceed your seat count</strong> — a Developer-tier
            license may not be used by more than 1 Developer or across
            multiple legal entities.
          </li>
          <li>
            <strong>Share with unlicensed parties</strong> — you may
            not share, loan, or grant access to the source to any
            individual or organisation that has not purchased their
            own license.
          </li>
          <li>
            <strong>Compete directly</strong> — you may not use the
            Product to create a product whose primary purpose is to
            compete with checkout-kit (e.g. a Stripe starter kit, a
            checkout boilerplate sold to other developers).
          </li>
          <li>
            <strong>AI / ML training</strong> — you may not use the
            Product source code, in whole or in part, to train,
            fine-tune, or evaluate any artificial intelligence or
            machine learning model.
          </li>
          <li>
            <strong>Remove copyright notices</strong> — you may not
            remove or alter any copyright, trademark, or attribution
            notices embedded in the source, except as explicitly
            permitted by the Extended tier.
          </li>
        </ul>
      </P>

      <H2>Intellectual property</H2>
      <P>
        The Author retains all intellectual property rights in and to
        the Product. This license is a grant of usage rights only —
        it does not transfer ownership. All copyright, trade secret,
        and other proprietary rights in the Product remain with the
        Author.
      </P>
      <P>
        Your modifications and extensions to the Product belong to
        you, provided they do not constitute a substantial reproduction
        of the Product itself.
      </P>

      <H2>Warranty disclaimer</H2>
      <P>
        The Product is provided <strong>"as is"</strong>, without
        warranty of any kind, express or implied, including but not
        limited to warranties of merchantability, fitness for a
        particular purpose, or non-infringement. The Author does not
        warrant that the Product will be error-free, uninterrupted,
        or compatible with all environments.
      </P>

      <H2>Limitation of liability</H2>
      <P>
        To the maximum extent permitted by applicable law, the
        Author's total liability for any claim arising out of or
        related to this license or the Product shall not exceed the
        amount you paid for your license tier. The Author shall not
        be liable for any indirect, incidental, special, consequential,
        or punitive damages, including loss of profits or data, even
        if advised of the possibility of such damages.
      </P>

      <H2>Cross-edition discount</H2>
      <P>
        Already own one edition (Go or Node) and want the other?
        Email us with your purchase id and you get{' '}
        <strong>50% off</strong> the matching tier of the other
        edition. No expiry.
      </P>

      <Callout variant="warning" title="This page is a summary — not the binding contract">
        The full legal terms are delivered at the point of purchase
        on{' '}
        <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
          dashforge-ui.com
        </span>
        . In the event of any conflict between this summary and the
        full terms, the full terms prevail. Questions:{' '}
        <span style={{ fontFamily: 'monospace' }}>
          info@dashforge-ui.com
        </span>
      </Callout>
    </>
  );
}
