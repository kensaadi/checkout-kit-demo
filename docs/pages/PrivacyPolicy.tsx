import { Callout } from '../components/Callout';
import { H2, P, PageTitle } from '../components/PageTitle';

export function PrivacyPolicy() {
  return (
    <>
      <PageTitle
        eyebrow="Legal"
        title="Privacy Policy"
        description="How Ken Saadi / dashforge-ui.com handles personal data in connection with the purchase and delivery of checkout-kit."
      />

      <P style={{ color: '#8A8A8A', fontSize: '13px', marginTop: 0 }}>
        Last updated: June 2026
      </P>

      <P>
        This policy applies to personal data collected through{' '}
        <strong>dashforge-ui.com</strong> and its sub-domains in
        connection with the sale of checkout-kit. It is issued in
        compliance with the EU General Data Protection Regulation
        (GDPR) and applicable national data protection laws.
      </P>

      <H2>Data controller</H2>
      <P>
        The data controller is:
        <br />
        <strong>Ken Saadi</strong>
        <br />
        <span style={{ fontFamily: 'monospace' }}>info@dashforge-ui.com</span>
      </P>

      <H2>What data we collect and why</H2>
      <P>
        We collect only the data strictly necessary to process your
        purchase and deliver the product:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
          <li>
            <strong>Email address</strong> — provided at checkout via
            Stripe, used solely to deliver the product (source code
            access or download link) and to respond to support
            requests related to your purchase.
          </li>
          <li>
            <strong>Billing information</strong> (name, address,
            payment details) — collected and processed exclusively by
            Stripe, Inc., our payment processor. We never see, store,
            or have access to your card details.
          </li>
        </ul>
      </P>
      <P>
        <strong>Legal basis:</strong> processing is necessary for the
        performance of a contract to which you are party (GDPR
        Art. 6(1)(b)).
      </P>

      <H2>Data retention</H2>
      <P>
        We do not retain your personal data. Once the product has been
        delivered, your email address is not stored in any database or
        system under our control. Stripe retains transaction records
        pursuant to their own privacy policy and applicable financial
        regulations.
      </P>

      <H2>Third-party processors</H2>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
          <li>
            <strong>Stripe, Inc.</strong> — payment processing. Stripe
            acts as an independent data controller for payment data and
            as our data processor for transaction records. Stripe is
            certified under the EU–US Data Privacy Framework.{' '}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1a1a1a', fontWeight: 600 }}
            >
              Stripe Privacy Policy →
            </a>
          </li>
        </ul>
      </P>
      <P>
        We do not use third-party analytics, advertising networks, or
        tracking cookies on this site. No personal data is sold,
        rented, or shared with any third party for marketing purposes.
      </P>

      <H2>Cookies</H2>
      <P>
        This documentation site does not set any tracking or analytics
        cookies. The only browser storage used is{' '}
        <code>localStorage</code> to persist your UI preferences
        (theme mode, sidebar state, flavor selectors). This data never
        leaves your device.
      </P>

      <H2>Your rights (GDPR)</H2>
      <P>
        Under the GDPR you have the right to:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
          <li><strong>Access</strong> — request a copy of any personal data we hold about you</li>
          <li><strong>Rectification</strong> — request correction of inaccurate data</li>
          <li><strong>Erasure</strong> — request deletion of your personal data</li>
          <li><strong>Restriction</strong> — request that we restrict processing of your data</li>
          <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
          <li><strong>Objection</strong> — object to processing based on legitimate interests</li>
        </ul>
      </P>
      <P>
        Given that we do not retain personal data after delivery, most
        of these rights are satisfied by design. To exercise any right
        or raise a concern, contact us at{' '}
        <span style={{ fontFamily: 'monospace' }}>info@dashforge-ui.com</span>.
      </P>
      <P>
        You also have the right to lodge a complaint with your national
        data protection supervisory authority at any time.
      </P>

      <H2>Changes to this policy</H2>
      <P>
        We may update this policy to reflect changes in our practices
        or applicable law. The current version is always available at
        this URL. Material changes will be communicated via the email
        address associated with your purchase.
      </P>

      <Callout variant="info" title="Questions?">
        For any privacy-related question, contact{' '}
        <span style={{ fontFamily: 'monospace' }}>info@dashforge-ui.com</span>.
        We will respond within 30 days as required by GDPR.
      </Callout>
    </>
  );
}
