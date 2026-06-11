// Per-site configuratie. Sleutel = geregistreerd domein zonder "www.".
// Nieuwe site = hier een entry + een route in wrangler.jsonc.

export interface SiteConfig {
  name: string;
  heading: string;
  subtext: string;
  buttonLabel: string;
  /** Domein voor de Google-voorkeursbron-link (?q=...). */
  googleQuery: string;
  /** "dark" voor sites met een donkere achtergrond (bijv. Manners). */
  theme?: "light" | "dark";
}

// De Instellen-knop linkt hierheen; het "__"-prefix voorkomt verwarring met een artikel.
export const CLICK_PATH = "/__google-aanjager/click";

// Alle directe kinderen van een post-article (niet recepten: data-type="recipe").
export const BLOCK_SELECTOR = 'article.single[data-type="post"] > *';

export const SITES: Record<string, SiteConfig> = {
  "resport.nl": {
    name: "Resport",
    heading: "Resport altijd op pole position?",
    subtext: "Eén vinkje en wij staan voortaan helemaal vooraan in je Google-feed.",
    buttonLabel: "Instellen →",
    googleQuery: "resport.nl",
  },
  "culy.nl": {
    name: "Culy",
    heading: "Meer Culy in je Google? 🥐",
    subtext: "Vink ons aan als favoriet, dan staan onze lekkere recepten altijd vooraan.",
    buttonLabel: "Instellen →",
    googleQuery: "culy.nl",
  },
  "metronieuws.nl": {
    name: "Metro",
    heading: "Sneller bij het nieuws dat ertoe doet",
    subtext: "Stel Metro in als voorkeursbron en je vindt ons nieuws altijd terug in Google.",
    buttonLabel: "Instellen →",
    googleQuery: "metronieuws.nl",
  },
  "nsmbl.nl": {
    name: "NSMBL",
    heading: "Niks van NSMBL missen? 😍",
    subtext: "Maak ons je Google-favoriet, dan weet jij het zodra het gebeurt.",
    buttonLabel: "Instellen →",
    googleQuery: "nsmbl.nl",
  },
  "manners.nl": {
    name: "Manners",
    heading: "Meer Manners in je Google?",
    subtext: "Maak ons je voorkeursbron, dan zie je het beste altijd bovenaan.",
    buttonLabel: "Instellen →",
    googleQuery: "manners.nl",
    theme: "dark",
  },
  "jmouders.nl": {
    name: "J/M Ouders",
    heading: "Meer J/M Ouders in je Google?",
    subtext: "Vink ons aan als favoriet en mis onze beste verhalen en adviezen niet.",
    buttonLabel: "Instellen →",
    googleQuery: "jmouders.nl",
  },
  "want.nl": {
    name: "WANT",
    heading: "Meer WANT in je feed? ⚡",
    subtext: "Stel ons in als Google-favoriet, dan staat het laatste technieuws bovenaan.",
    buttonLabel: "Instellen →",
    googleQuery: "want.nl",
  },
};

/** Zoekt de config voor een host op; normaliseert een leidende "www.". */
export function lookupSite(hostname: string): SiteConfig | undefined {
  return SITES[hostname.replace(/^www\./, "").toLowerCase()];
}
