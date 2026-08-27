// Types en gedeelde paden voor de siteconfiguratie in wrangler.jsonc.

interface VariantConfig {
  enabled: boolean;
  heading: string;
  subtext: string;
  buttonLabel: string;
}

interface GoogleConfig extends VariantConfig {
  /** Domein voor de Google-voorkeursbron-link (?q=...). */
  query: string;
}

interface LinkedCtaConfig extends VariantConfig {
  url: string;
}

interface WebsiteVanHetJaarConfig extends LinkedCtaConfig {
  /** Sitespecifiek campagne-icoon; standaard is de gedeelde kroon. */
  icon?: "crown" | "metro-globe";
}

export interface NewsletterConfig extends VariantConfig {
  /** Echobox-campagne, bijv. urn:newsletter:campaign:UUID. */
  campaignUrn: string;
  /** Prefix van de Cloudflare-secrets: <prefix>_CLIENT_ID en <prefix>_REFRESH_TOKEN. */
  credentialBindingPrefix: string;
}

interface SiteVariants {
  google?: GoogleConfig;
  whatsapp?: LinkedCtaConfig;
  newsletter?: NewsletterConfig;
  websiteVanHetJaar?: WebsiteVanHetJaarConfig;
}

export interface SiteConfig {
  /** Hoofdschakelaar voor het CTA-blok; bestaande klikroutes blijven werken. */
  enabled: boolean;
  name: string;
  /** "dark" voor sites met een donkere achtergrond (bijv. Manners). */
  theme?: "light" | "dark";
  variants: SiteVariants;
}

export interface Env {
  SITES: Record<string, SiteConfig>;
  NEWSLETTERS: Record<string, NewsletterConfig>;
  /** Echobox-secrets, opgezocht via NewsletterConfig.credentialBindingPrefix. */
  [binding: string]: unknown;
}

// De Instellen-knop linkt hierheen; het "__"-prefix voorkomt verwarring met een artikel.
// Het "google-"-prefix blijft staan: hier hangt de bestaande klikdata aan.
export const GOOGLE_CLICK_PATH = "/__google-aanjager/click";

// Idem voor de Volgen-knop van de WhatsApp-variant, zodat de kliks apart telbaar zijn.
export const WHATSAPP_CLICK_PATH = "/__aanjager/click-whatsapp";

// Het formulier post naar de Worker; de Echobox-credentials komen nooit in de browser.
export const NEWSLETTER_SUBSCRIBE_PATH = "/__aanjager/subscribe-newsletter";

// Externe same-origin scriptresource, zodat de integratie niet van inline JavaScript afhangt.
export const NEWSLETTER_SCRIPT_PATH = "/__aanjager/newsletter.js";

// Eigen klikroute voor de Website van het Jaar-variant, zodat de kliks apart telbaar zijn.
export const WEBSITE_VAN_HET_JAAR_CLICK_PATH =
  "/__aanjager/click-website-van-het-jaar";

// Gezet na een geslaagde inschrijving; de Worker laat de nieuwsbriefvariant dan weg.
export const NEWSLETTER_SUBSCRIBED_COOKIE = "__aanjager-newsletter-subscribed";

// Alle directe kinderen van een post-article (niet recepten: data-type="recipe").
export const BLOCK_SELECTOR = 'article.single[data-type="post"] > *';

/** Zoekt de config voor een host op; normaliseert een leidende "www.". */
export function lookupSite(
  sites: Record<string, SiteConfig>,
  hostname: string,
  newsletters?: Record<string, NewsletterConfig>,
): SiteConfig | undefined {
  const normalizedHostname = hostname.replace(/^www\./, "").toLowerCase();
  const site = sites[normalizedHostname];
  const newsletter = newsletters?.[normalizedHostname];
  if (!site || !newsletter) return site;

  return {
    ...site,
    variants: { ...site.variants, newsletter },
  };
}
