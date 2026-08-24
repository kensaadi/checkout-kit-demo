/**
 * JSON-LD builders. Each returns a plain object that <Seo>
 * serialises into a single <script type="application/ld+json">.
 *
 * Why standalone builders (not a class):
 *   - dead-code elimination via tree-shaking when a page only
 *     uses one schema
 *   - trivial unit-testing
 *   - schema.org docs map 1:1 to function args
 */

import { absoluteUrl, SITE_NAME, SITE_URL } from './config';

type JsonLdObject = Record<string, unknown>;

export function websiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en',
  };
}

export function organizationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dashforge',
    url: 'https://dashforge-ui.com',
    sameAs: [
      'https://github.com/dashforge-ui',
      'https://twitter.com/dashforge_ui',
    ],
  };
}

export type Breadcrumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Breadcrumb[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export type Offer = {
  name: string;
  priceUsd: number;
  description: string;
};

export function softwareApplicationSchema(args: {
  name: string;
  description: string;
  offers: Offer[];
  applicationCategory?: string;
  operatingSystem?: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: args.name,
    description: args.description,
    applicationCategory: args.applicationCategory ?? 'DeveloperApplication',
    operatingSystem: args.operatingSystem ?? 'Any',
    offers: args.offers.map((o) => ({
      '@type': 'Offer',
      name: o.name,
      price: o.priceUsd,
      priceCurrency: 'USD',
      description: o.description,
      availability: 'https://schema.org/InStock',
    })),
  };
}

export type FaqEntry = { question: string; answer: string };

export function faqPageSchema(entries: FaqEntry[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: e.answer,
      },
    })),
  };
}

export function techArticleSchema(args: {
  headline: string;
  description: string;
  path: string;
  section?: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: args.headline,
    description: args.description,
    url: absoluteUrl(args.path),
    inLanguage: 'en',
    isPartOf: {
      '@type': 'CreativeWork',
      name: `${SITE_NAME} documentation`,
      url: absoluteUrl('/docs'),
    },
    ...(args.section ? { articleSection: args.section } : {}),
  };
}

/**
 * Composed structured-data blob. JSON-LD spec allows multiple
 * @type entries via an array — `<Seo>` does not need to know.
 */
export function combineJsonLd(...blobs: JsonLdObject[]): JsonLdObject[] {
  return blobs.filter(Boolean);
}
