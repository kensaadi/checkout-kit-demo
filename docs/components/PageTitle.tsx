import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Seo, type SeoProps } from '../../seo';
import {
  breadcrumbSchema,
  techArticleSchema,
  combineJsonLd,
  type Breadcrumb,
} from '../../seo/jsonLd';
import { docsNavigation } from '../navigation';

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Skip the Seo emission (page renders its own <Seo />). */
  seoSkip?: boolean;
  /** Extra JSON-LD to merge with the default TechArticle + breadcrumbs. */
  seoJsonLd?: SeoProps['jsonLd'];
};

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

/**
 * Shared page header used by every documentation page so titles
 * line up vertically and the eyebrow / description spacing stays
 * uniform across the docs.
 *
 * Also acts as the docs' single SEO emission point: title +
 * description flow straight into <Seo> so every docs page is
 * indexable with no per-page boilerplate. Pages that need
 * something specific (Pricing → FAQ, etc.) pass `seoJsonLd`.
 */
export function PageTitle({
  eyebrow,
  title,
  description,
  seoSkip,
  seoJsonLd,
}: Props) {
  const isMdUp = useIsMdUp();
  return (
    <>
      {!seoSkip && (
        <DocsSeo title={title} description={description} extra={seoJsonLd} />
      )}
      <div style={{ marginBottom: 32 }}>
        {eyebrow && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#8A8A8A',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          style={{
            fontSize: isMdUp ? 34 : 28,
            fontWeight: 800,
            lineHeight: 1.15,
            margin: 0,
            marginBottom: description ? 12 : 0,
            letterSpacing: '-0.015em',
            color: '#1a1a1a',
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: '16px',
              color: '#545454',
              lineHeight: 1.65,
              maxWidth: 640,
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </>
  );
}

/**
 * Internal: derives breadcrumbs from the path against the docs
 * navigation, then emits <Seo> with title + description + a
 * TechArticle schema + BreadcrumbList.
 */
function DocsSeo({
  title,
  description,
  extra,
}: {
  title: string;
  description?: string;
  extra?: SeoProps['jsonLd'];
}) {
  const location = useLocation();
  const path = location.pathname;
  const crumbs = buildBreadcrumbs(path, title);
  const article = techArticleSchema({
    headline: title,
    description:
      description ?? `${title} — checkout-kit documentation.`,
    path,
    section: crumbs[1]?.name,
  });
  const ld = combineJsonLd(article, breadcrumbSchema(crumbs));
  const extraArr = Array.isArray(extra) ? extra : extra ? [extra] : [];
  return (
    <Seo
      title={title}
      description={description}
      jsonLd={[...ld, ...extraArr]}
    />
  );
}

function buildBreadcrumbs(path: string, fallback: string): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [
    { name: 'Home', path: '/' },
    { name: 'Docs', path: '/docs' },
  ];
  for (const section of docsNavigation) {
    for (const item of section.items) {
      if (item.path === path && item.path !== '/docs') {
        crumbs.push({ name: section.section, path: item.path });
        crumbs.push({ name: item.label, path: item.path });
        return crumbs;
      }
    }
  }
  if (path !== '/docs') {
    crumbs.push({ name: fallback, path });
  }
  return crumbs;
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 22,
        fontWeight: 700,
        marginTop: 40,
        marginBottom: 20,
        color: '#1a1a1a',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 17,
        fontWeight: 700,
        marginTop: 28,
        marginBottom: 12,
        color: '#1a1a1a',
      }}
    >
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '14.5px',
        color: '#374151',
        lineHeight: 1.75,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}
