import { useLocation } from 'react-router-dom';
import {
  DEFAULT_DESCRIPTION,
  SITE_URL,
  absoluteUrl,
  composeTitle,
} from './config';

/**
 * Declarative per-route SEO. Renders document-level tags via React
 * 19's native head-hoisting — no helmet, no portal, no library.
 *
 *   <Seo
 *     title="Pricing"
 *     description="Go from $399, Node from $299..."
 *     jsonLd={[softwareApplicationSchema(...), breadcrumbSchema(...)]}
 *   />
 *
 * Emits ONLY the tags that must vary per route: `<title>`,
 * description, canonical, robots, hreflang, and JSON-LD. Anything not
 * provided falls back to the site-wide defaults in `config.ts`.
 * Pages that handle private data pass `noindex` so crawlers skip them.
 *
 * Open Graph / Twitter are deliberately NOT emitted here — they live
 * as static homepage values in `index.html`. React 19 head-hoisting
 * APPENDS tags rather than replacing the static ones, so emitting OG
 * here too would put two `og:title` / `og:url` in the DOM. The static
 * set is also the only thing no-JS social scrapers ever see (a SPA
 * can't serve per-route OG without prerendering), so one valid
 * homepage card there is the right call. See index.html for the
 * rationale of the split.
 *
 * Why this lives in `src/seo/` and not feature folders: SEO is
 * a cross-cutting concern that buyers tweak independently from
 * any one screen. One file to fork, one mental model.
 */
export type SeoProps = {
  /** Page title; the brand suffix " · checkout-kit" is added automatically. */
  title?: string;
  /** Page description; falls back to DEFAULT_DESCRIPTION. */
  description?: string;
  /** Override canonical path (defaults to the current location). */
  canonicalPath?: string;
  /** When true, emit `<meta name="robots" content="noindex,nofollow">`. */
  noindex?: boolean;
  /** Single JSON-LD object or an array of them; serialised as one <script>. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function Seo({
  title,
  description,
  canonicalPath,
  noindex,
  jsonLd,
}: SeoProps) {
  const location = useLocation();
  const fullTitle = composeTitle(title);
  const desc = description ?? DEFAULT_DESCRIPTION;
  const path = canonicalPath ?? location.pathname;
  const canonical = absoluteUrl(path);

  const ldArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large" />
      )}

      {/* Hint to crawlers that this is the only site language. */}
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={SITE_URL + path} />

      {ldArray.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Escape `</` to avoid breaking out of the <script> tag.
            // Necessary even though JSON.stringify quotes the strings.
            __html: JSON.stringify(ld).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
