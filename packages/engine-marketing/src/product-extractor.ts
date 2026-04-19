/**
 * Product extractor — turn a paste/URL into ProductBrief.
 *
 * Three input modes:
 *   - **paste**: operator pasted copy (most reliable)
 *   - **url**: we fetch the page and parse Open Graph / oEmbed / meta tags
 *   - **manual**: fully structured form from the Hub UI
 *
 * We do NOT try to be a full web scraper. The URL path uses only standard
 * metadata tags (OG, Twitter Card, JSON-LD `Product`). When those are
 * missing, we surface a `warnings[]` array rather than hallucinating fields.
 *
 * The extracted ProductBrief then feeds the MarketingOrchestrator the
 * same way a ShotRequest feeds CinemaOrchestrator.
 */

export interface ProductBrief {
  /** Canonical product name — shows up in prompts + ad copy. */
  name: string;
  /** 1–2 sentence pitch. */
  description: string;
  /** Price + currency (display-formatted). */
  price?: string;
  /** Remote image URLs — operator can later upload into an Element. */
  imageUrls: string[];
  /** Source URL if extracted from a page. */
  sourceUrl?: string;
  /** Free-form key/value attributes (material, color, size, etc). */
  attributes?: Record<string, string>;
  /** Issues encountered during extraction — surface to UI, don't throw. */
  warnings: string[];
}

/**
 * Parse Open Graph / Twitter Card / JSON-LD from raw HTML.
 *
 * We intentionally use simple regex extraction rather than a full HTML
 * parser — most product pages surface all the needed metadata in `<meta>`
 * tags and a single JSON-LD script, both of which regex handles cleanly.
 * Pages that hide everything behind client-side JS return a low-quality
 * brief with warnings; operator fixes by editing in the UI.
 */
export function parseProductFromHtml(
  html: string,
  sourceUrl?: string,
): ProductBrief {
  const warnings: string[] = [];

  const meta = (name: string): string | undefined => {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i",
    );
    const m = html.match(re);
    return m?.[1];
  };

  const name =
    meta("og:title") ??
    meta("twitter:title") ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
    "";

  const description =
    meta("og:description") ??
    meta("twitter:description") ??
    meta("description") ??
    "";

  const imageUrls: string[] = [];
  const ogImg = meta("og:image");
  if (ogImg) imageUrls.push(ogImg);
  const twImg = meta("twitter:image");
  if (twImg && !imageUrls.includes(twImg)) imageUrls.push(twImg);

  // JSON-LD Product — optional, adds price + extras when present.
  let price: string | undefined;
  const attributes: Record<string, string> = {};
  const ldMatches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const match of ldMatches) {
    try {
      const payload = JSON.parse(match[1]!.trim());
      const items = Array.isArray(payload) ? payload : [payload];
      for (const item of items) {
        if (item?.["@type"] === "Product") {
          if (item.offers?.price) {
            const currency = item.offers.priceCurrency ?? "";
            price = `${currency} ${item.offers.price}`.trim();
          }
          if (Array.isArray(item.image)) {
            for (const u of item.image) {
              if (typeof u === "string" && !imageUrls.includes(u)) {
                imageUrls.push(u);
              }
            }
          }
          if (item.brand?.name) attributes.brand = String(item.brand.name);
          if (item.color) attributes.color = String(item.color);
          if (item.material) attributes.material = String(item.material);
        }
      }
    } catch {
      // Non-Product JSON-LD is common (Organization, BreadcrumbList, etc).
      // Silently skip parse failures.
    }
  }

  if (!name) warnings.push("No product name found in OG/twitter/title tags");
  if (!description) warnings.push("No product description found");
  if (imageUrls.length === 0)
    warnings.push("No product images found — upload manually");

  return {
    name,
    description,
    price,
    imageUrls,
    sourceUrl,
    attributes: Object.keys(attributes).length ? attributes : undefined,
    warnings,
  };
}

/**
 * Fetch a URL and extract. Returns a low-quality brief + warnings on any
 * network or parse issue rather than throwing.
 */
export async function extractProductFromUrl(
  url: string,
  opts: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<ProductBrief> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 10_000,
  );
  const signal = opts.signal ?? controller.signal;

  try {
    const res = await fetch(url, {
      headers: {
        // Some sites block bots without a UA.
        "User-Agent":
          "Mozilla/5.0 (compatible; MarionetteBot/1.0; +https://marionette.studio)",
      },
      signal,
    });
    if (!res.ok) {
      return emptyBrief(url, [
        `HTTP ${res.status} fetching ${url}`,
      ]);
    }
    const html = await res.text();
    return parseProductFromHtml(html, url);
  } catch (err) {
    return emptyBrief(url, [
      `fetch failed: ${err instanceof Error ? err.message : String(err)}`,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function emptyBrief(sourceUrl: string, warnings: string[]): ProductBrief {
  return {
    name: "",
    description: "",
    imageUrls: [],
    sourceUrl,
    warnings,
  };
}

/**
 * Construct a brief from a free-form paste (no URL fetch). We split the
 * first line as the name and the rest as the description.
 */
export function parseProductFromPaste(text: string): ProductBrief {
  const trimmed = text.trim();
  if (!trimmed) {
    return emptyBrief("", ["empty paste"]);
  }
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const name = lines[0] ?? "";
  const description = lines.slice(1).join(" ").trim();
  return {
    name,
    description,
    imageUrls: [],
    warnings: description
      ? []
      : ["Only a product name was pasted — consider adding a description"],
  };
}
