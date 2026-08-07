import {
  NEWSLETTER_CLIENT_SCRIPT,
  buildInjectedHtml,
  type Variant,
} from "./injected-block";
import { handleNewsletterSubscription, type Env } from "./newsletter";
import {
  BLOCK_SELECTOR,
  CLICK_PATH,
  NEWSLETTER_SCRIPT_PATH,
  NEWSLETTER_SUBSCRIBE_PATH,
  NEWSLETTER_SUBSCRIBED_COOKIE,
  WHATSAPP_CLICK_PATH,
  lookupSite,
  type SiteConfig,
} from "./sites";

interface InjectionState {
  bannersHidden: boolean;
}

// In de huidige datalayer betekent show_banners: 0 dat banners verborgen zijn.
// Ondersteun ook de expliciete inverse vlag, mocht een site die gebruiken.
const HIDDEN_BANNERS_PATTERN =
  /(?:["']?show_banners["']?\s*:\s*(?:0|false|["'](?:0|false)["'])|["']?hide_banners["']?\s*:\s*(?:1|true|["'](?:1|true)["']))(?=\s*[,}])/i;
const DATALAYER_NAME_PATTERN = /\bdataLayer\b/;
const DATALAYER_PATTERN_TAIL_LENGTH = 128;

function chooseVariant(site: SiteConfig, cookieHeader: string | null): Variant {
  const variants: Variant[] = ["google"];
  if (site.whatsapp) variants.push("whatsapp");
  // Wie zich via dit blok al heeft ingeschreven, krijgt de nieuwsbrief niet meer.
  const subscribed = cookieHeader?.includes(`${NEWSLETTER_SUBSCRIBED_COOKIE}=1`) ?? false;
  if (site.newsletter && !subscribed) variants.push("newsletter");
  return variants[Math.floor(Math.random() * variants.length)];
}

class BannerVisibilityDetector {
  private tail = "";
  private dataLayerFound = false;
  private hiddenBannersFound = false;

  constructor(private readonly state: InjectionState) {}

  element(): void {
    this.tail = "";
    this.dataLayerFound = false;
    this.hiddenBannersFound = false;
  }

  text(chunk: Text): void {
    if (this.state.bannersHidden) return;

    const text = this.tail + chunk.text;
    this.dataLayerFound ||= DATALAYER_NAME_PATTERN.test(text);
    this.hiddenBannersFound ||= HIDDEN_BANNERS_PATTERN.test(text);

    if (this.dataLayerFound && this.hiddenBannersFound) {
      this.state.bannersHidden = true;
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
    if (this.state.bannersHidden) {
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
    const site = lookupSite(url.hostname);

    if (site?.enabled && site.newsletter) {
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

    // Klik op Instellen: 302 naar Google; deze request telt de kliks in de analytics.
    if (url.pathname === CLICK_PATH) {
      if (!site) return fetch(request);
      const destination = `https://www.google.com/preferences/source?q=${encodeURIComponent(site.googleQuery)}`;
      return Response.redirect(destination, 302);
    }

    // Klik op Volgen (WhatsApp-variant): 302 naar het kanaal, apart telbaar.
    if (url.pathname === WHATSAPP_CLICK_PATH) {
      if (!site?.whatsapp) return fetch(request);
      return Response.redirect(site.whatsapp.url, 302);
    }

    if (!site?.enabled || request.method !== "GET") return fetch(request);

    const response = await fetch(request);
    if (!response.headers.get("content-type")?.includes("text/html")) {
      return response;
    }

    // Kies gelijkmatig uit alle varianten die voor deze site zijn geconfigureerd.
    const variant = chooseVariant(site, request.headers.get("cookie"));
    const injectionState: InjectionState = { bannersHidden: false };

    // Bij een fout de pagina nooit breken: serveer dan de origin ongewijzigd.
    try {
      return new HTMLRewriter()
        .on("script", new BannerVisibilityDetector(injectionState))
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
