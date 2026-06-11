// Per-site configuratie. Sleutel = geregistreerd domein zonder "www.".
// Een nieuwe site toevoegen = hier een entry bijzetten + een route in
// wrangler.jsonc voor de bijbehorende zone.

export interface SiteConfig {
  /** Merknaam, gebruikt in de aria-label. */
  name: string;
  /** Kop van de CTA. */
  heading: string;
  /** Subtekst onder de kop. */
  subtext: string;
  /** Tekst op de knop. */
  buttonLabel: string;
  /** Domein voor de Google-voorkeursbron-link (?q=...). */
  googleQuery: string;
  /** Selector waarná geïnjecteerd wordt; default DEFAULT_SELECTOR. */
  selector?: string;
}

// Pad waar de Instellen-knop naartoe linkt; de worker telt de kliks hier en
// stuurt door naar Google. Het "__"-prefix voorkomt verwarring met een artikel.
export const CLICK_PATH = "/__google-aanjager/click";

// Alleen het "post"-type, niet andere post-types zoals recepten
// (die hebben data-type="recipe"). Per site overschrijfbaar via `selector`.
export const DEFAULT_SELECTOR = 'article.single[data-type="post"] p';

export const SITES: Record<string, SiteConfig> = {
  "resport.nl": {
    name: "Resport",
    heading: "Resport altijd op pole position?",
    subtext: "Eén vinkje en wij staan voortaan eerst in je Google-feed.",
    buttonLabel: "Instellen →",
    googleQuery: "resport.nl",
  },
  "culy.nl": {
    name: "Culy",
    heading: "Meer Culy in je Google? 🥐",
    subtext: "Vink ons aan als voorkeursbron, dan staan onze lekkere recepten altijd vooraan.",
    buttonLabel: "Instellen →",
    googleQuery: "culy.nl",
  },
};

/** Zoekt de config voor een host op; normaliseert een leidende "www.". */
export function lookupSite(hostname: string): SiteConfig | undefined {
  return SITES[hostname.replace(/^www\./, "").toLowerCase()];
}
