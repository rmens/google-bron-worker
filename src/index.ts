import { buildInjectedHtml } from "./injected-block";
import { CLICK_PATH, DEFAULT_SELECTOR, lookupSite } from "./sites";

// Injecteert HTML ná de eerste match en negeert de rest.
class FirstMatchInjector {
  private injected = false;

  constructor(private readonly html: string) {}

  element(element: Element): void {
    if (this.injected) return;
    this.injected = true;
    element.after(this.html, { html: true });
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const site = lookupSite(url.hostname);

    // Klik op de Instellen-knop: 302 naar de Google-voorkeursbron van deze site.
    // De request op dit pad is meteen de telbare gebeurtenis in de analytics.
    if (url.pathname === CLICK_PATH) {
      if (!site) return fetch(request);
      const destination = `https://www.google.com/preferences/source?q=${encodeURIComponent(site.googleQuery)}`;
      return Response.redirect(destination, 302);
    }

    // Onbekende host of niet-GET: ongewijzigd doorlaten.
    if (!site || request.method !== "GET") return fetch(request);

    const response = await fetch(request);
    if (!response.headers.get("content-type")?.includes("text/html")) {
      return response;
    }

    // Injecteer; bij een onverwachte fout (bijv. een ongeldige selector in de
    // config) de pagina nooit breken — serveer dan de origin ongewijzigd.
    try {
      return new HTMLRewriter()
        .on(site.selector ?? DEFAULT_SELECTOR, new FirstMatchInjector(buildInjectedHtml(site)))
        .transform(response);
    } catch (error) {
      console.error("Injectie overgeslagen voor", url.hostname, error);
      return response;
    }
  },
} satisfies ExportedHandler;
