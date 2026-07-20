import { buildInjectedHtml, type Variant } from "./injected-block";
import { BLOCK_SELECTOR, CLICK_PATH, WHATSAPP_CLICK_PATH, lookupSite } from "./sites";

// Injecteert het blok vóór het eerste element ná de eerste echte alinea, dus
// niet ónder een kop. Een "In het kort"-samenvatting telt niet als alinea, en
// artikelen met maar één alinea krijgen niets.
class ParagraphInjector {
  private injected = false;
  private seenParagraph = false;
  private capturing = false;
  private buffer = "";

  constructor(private readonly html: string) {}

  element(element: Element): void {
    if (this.injected) return;
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
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const site = lookupSite(url.hostname);

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

    if (!site || request.method !== "GET") return fetch(request);

    const response = await fetch(request);
    if (!response.headers.get("content-type")?.includes("text/html")) {
      return response;
    }

    // A/b: heeft de site een WhatsApp-config, dan wisselen Google en WhatsApp
    // elkaar per pageview 50/50 af.
    const variant: Variant = site.whatsapp && Math.random() < 0.5 ? "whatsapp" : "google";

    // Bij een fout de pagina nooit breken: serveer dan de origin ongewijzigd.
    try {
      return new HTMLRewriter()
        .on(BLOCK_SELECTOR, new ParagraphInjector(buildInjectedHtml(site, variant)))
        .transform(response);
    } catch (error) {
      console.error("Injectie overgeslagen voor", url.hostname, error);
      return response;
    }
  },
} satisfies ExportedHandler;
