import {
  NEWSLETTER_CLIENT_SCRIPT,
  buildInjectedHtml,
  type Variant,
} from "./injected-block";
import { handleNewsletterSubscription, type Env } from "./newsletter";
import {
  BLOCK_SELECTOR,
  GOOGLE_CLICK_PATH,
  NEWSLETTER_SCRIPT_PATH,
  NEWSLETTER_SUBSCRIBE_PATH,
  NEWSLETTER_SUBSCRIBED_COOKIE,
  WEBSITE_VAN_HET_JAAR_CLICK_PATH,
  WHATSAPP_CLICK_PATH,
  lookupSite,
  type SiteConfig,
} from "./sites";

interface InjectionState {
  blocked: boolean;
}

// In de huidige datalayer betekent show_banners: 0 dat banners verborgen zijn.
// Ondersteun ook de expliciete inverse vlag, mocht een site die gebruiken.
const HIDDEN_BANNERS_PATTERN =
  /(?:["']?show_banners["']?\s*:\s*(?:0|false|["'](?:0|false)["'])|["']?hide_banners["']?\s*:\s*(?:1|true|["'](?:1|true)["']))(?=\s*[,}])/i;
const DATALAYER_NAME_PATTERN = /\bdataLayer\b/;
const DATALAYER_TAGS_PATTERN = /["']?Tags["']?\s*:\s*["']([^"']*)["']/gi;
const NO_PROMO_TAG = "nopromo";
const DATALAYER_PATTERN_TAIL_LENGTH = 512;

type RedirectResolver = (site: SiteConfig) => string | undefined;

const CLICK_REDIRECTS = new Map<string, RedirectResolver>([
  [
    GOOGLE_CLICK_PATH,
    (site) =>
      site.variants.google
        ? `https://www.google.com/preferences/source?q=${encodeURIComponent(site.variants.google.query)}`
        : undefined,
  ],
  [WHATSAPP_CLICK_PATH, (site) => site.variants.whatsapp?.url],
  [
    WEBSITE_VAN_HET_JAAR_CLICK_PATH,
    (site) => site.variants.websiteVanHetJaar?.url,
  ],
]);

function hasCookie(
  cookieHeader: string | null,
  name: string,
  expectedValue: string,
): boolean {
  if (!cookieHeader) return false;

  return cookieHeader.split(";").some((cookie) => {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) return false;

    const cookieName = cookie.slice(0, separatorIndex).trim();
    const cookieValue = cookie.slice(separatorIndex + 1).trim();
    return cookieName === name && cookieValue === expectedValue;
  });
}

function chooseVariant(
  site: SiteConfig,
  cookieHeader: string | null,
): Variant | undefined {
  const variants: Variant[] = [];
  if (site.variants.google?.enabled) variants.push("google");
  if (site.variants.whatsapp?.enabled) variants.push("whatsapp");
  // Wie zich via dit blok al heeft ingeschreven, krijgt de nieuwsbrief niet meer.
  const subscribed = hasCookie(
    cookieHeader,
    NEWSLETTER_SUBSCRIBED_COOKIE,
    "1",
  );
  if (site.variants.newsletter?.enabled && !subscribed) {
    variants.push("newsletter");
  }
  if (site.variants.websiteVanHetJaar?.enabled) {
    variants.push("website-van-het-jaar");
  }
  if (variants.length === 0) return undefined;
  return variants[Math.floor(Math.random() * variants.length)];
}

function hasNoPromoTag(script: string): boolean {
  return [...script.matchAll(DATALAYER_TAGS_PATTERN)].some(([, tags]) =>
    tags.split(",").some((tag) => tag.trim().toLowerCase() === NO_PROMO_TAG)
  );
}

class InjectionEligibilityDetector {
  private tail = "";
  private dataLayerFound = false;
  private hiddenBannersFound = false;
  private noPromoTagFound = false;

  constructor(private readonly state: InjectionState) {}

  element(): void {
    this.tail = "";
    this.dataLayerFound = false;
    this.hiddenBannersFound = false;
    this.noPromoTagFound = false;
  }

  text(chunk: Text): void {
    if (this.state.blocked) return;

    const text = this.tail + chunk.text;
    this.dataLayerFound ||= DATALAYER_NAME_PATTERN.test(text);
    this.hiddenBannersFound ||= HIDDEN_BANNERS_PATTERN.test(text);
    this.noPromoTagFound ||= hasNoPromoTag(text);

    if (
      this.dataLayerFound &&
      (this.hiddenBannersFound || this.noPromoTagFound)
    ) {
      this.state.blocked = true;
      return;
    }

    this.tail = text.slice(-DATALAYER_PATTERN_TAIL_LENGTH);
  }
}

// Injecteert het blok vóór het eerste element ná de eerste echte alinea, dus
// niet ónder een kop. Een "In het kort"-samenvatting telt niet als alinea, en
// artikelen met maar één alinea krijgen niets.
class ParagraphInjector {
  private injected = false;
  private seenParagraph = false;
  private capturing = false;
  private buffer = "";

  constructor(
    private readonly html: string,
    private readonly state: InjectionState,
  ) {}

  element(element: Element): void {
    if (this.injected) return;
    if (this.state.blocked) {
      this.injected = true;
      return;
    }
    if (this.seenParagraph) {
      this.injected = true;
      element.before(this.html, { html: true });
      return;
    }
    if (element.tagName.toLowerCase() !== "p") return;
    this.buffer = "";
    this.capturing = true;
    element.onEndTag(() => {
      this.capturing = false;
      const text = this.buffer.trim().toLowerCase();
      if (text.startsWith("in het kort") || text.startsWith("⚡")) return;
      this.seenParagraph = true;
    });
  }

  text(chunk: Text): void {
    if (this.capturing) this.buffer += chunk.text;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const site = lookupSite(env.SITES, url.hostname);

    if (site?.enabled && site.variants.newsletter) {
      if (url.pathname === NEWSLETTER_SCRIPT_PATH && request.method === "GET") {
        return new Response(NEWSLETTER_CLIENT_SCRIPT, {
          headers: {
            "cache-control": "public, max-age=86400",
            "content-type": "application/javascript; charset=utf-8",
            "x-content-type-options": "nosniff",
          },
        });
      }
      if (url.pathname === NEWSLETTER_SUBSCRIBE_PATH && request.method === "POST") {
        return handleNewsletterSubscription(request, env, site, url.origin);
      }
    }

    // Externe CTA-kliks gaan via eigen paden, zodat Cloudflare ze apart kan tellen.
    const resolveRedirect = CLICK_REDIRECTS.get(url.pathname);
    if (resolveRedirect) {
      const destination = site ? resolveRedirect(site) : undefined;
      return destination ? Response.redirect(destination, 302) : fetch(request);
    }

    if (!site?.enabled || request.method !== "GET") return fetch(request);

    const response = await fetch(request);
    if (!response.headers.get("content-type")?.includes("text/html")) {
      return response;
    }

    // Kies gelijkmatig uit alle varianten die voor deze site zijn geconfigureerd.
    const variant = chooseVariant(site, request.headers.get("cookie"));
    if (!variant) return response;
    const injectionState: InjectionState = { blocked: false };

    // Bij een fout de pagina nooit breken: serveer dan de origin ongewijzigd.
    try {
      return new HTMLRewriter()
        .on("script", new InjectionEligibilityDetector(injectionState))
        .on(
          BLOCK_SELECTOR,
          new ParagraphInjector(buildInjectedHtml(site, variant), injectionState),
        )
        .transform(response);
    } catch (error) {
      console.error("Injectie overgeslagen voor", url.hostname, error);
      return response;
    }
  },
} satisfies ExportedHandler<Env>;
