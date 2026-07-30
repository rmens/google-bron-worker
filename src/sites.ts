// Per-site configuratie. Sleutel = geregistreerd domein zonder "www.".
// Nieuwe site = hier een entry + een route in wrangler.jsonc.

export interface SiteConfig {
  /** Hoofdschakelaar voor het CTA-blok; bestaande klikroutes blijven werken. */
  enabled: boolean;
  name: string;
  heading: string;
  subtext: string;
  buttonLabel: string;
  /** Domein voor de Google-voorkeursbron-link (?q=...). */
  googleQuery: string;
  /** "dark" voor sites met een donkere achtergrond (bijv. Manners). */
  theme?: "light" | "dark";
  /** Indien gezet: 50/50 a/b-test tussen het Google-blok en dit WhatsApp-blok. */
  whatsapp?: {
    heading: string;
    subtext: string;
    buttonLabel: string;
    /** Kanaal-URL, bijv. https://whatsapp.com/channel/XXXXXXXX */
    url: string;
  };
}

// De Instellen-knop linkt hierheen; het "__"-prefix voorkomt verwarring met een artikel.
// Het "google-"-prefix blijft staan: hier hangt de bestaande klikdata aan.
export const CLICK_PATH = "/__google-aanjager/click";

// Idem voor de Volgen-knop van de WhatsApp-variant, zodat de kliks apart telbaar zijn.
export const WHATSAPP_CLICK_PATH = "/__aanjager/click-whatsapp";

// Alle directe kinderen van een post-article (niet recepten: data-type="recipe").
export const BLOCK_SELECTOR = 'article.single[data-type="post"] > *';

export const SITES: Record<string, SiteConfig> = {
  "resport.nl": {
    enabled: true,
    name: "Resport",
    heading: "Resport altijd op pole position?",
    subtext: "Eén vinkje en wij staan voortaan helemaal vooraan in je Google-feed.",
    buttonLabel: "Instellen →",
    googleQuery: "resport.nl",
  },
  "culy.nl": {
    enabled: true,
    name: "Culy",
    heading: "Meer Culy in je Google? 🥐",
    subtext: "Vink ons aan als favoriet, dan staan onze lekkere recepten altijd vooraan.",
    buttonLabel: "Instellen →",
    googleQuery: "culy.nl",
  },
  "metronieuws.nl": {
    enabled: true,
    name: "Metro",
    heading: "Sneller bij het nieuws dat ertoe doet",
    subtext: "Stel Metro in als voorkeursbron en je vindt ons nieuws altijd terug in Google.",
    buttonLabel: "Instellen →",
    googleQuery: "metronieuws.nl",
    whatsapp: {
      heading: "Metronieuws op WhatsApp",
      subtext: "De opvallendste nieuwtjes, mooiste verhalen en handigste tips direct in WhatsApp.",
      buttonLabel: "Volg Metro",
      url: "https://whatsapp.com/channel/0029VaZVwso84Om3u2Bnqd1m",
    },
  },
  "nsmbl.nl": {
    enabled: true,
    name: "NSMBL",
    heading: "Niks van NSMBL missen? 😍",
    subtext: "Maak ons je Google-favoriet, dan weet jij het zodra het gebeurt.",
    buttonLabel: "Instellen →",
    googleQuery: "nsmbl.nl",
    whatsapp: {
      heading: "Join NSMBL op WhatsApp 👀",
      subtext: "Must-reads, winacties en uitnodigingen voor onze events. Op WhatsApp hoor jij het als eerste van ons.",
      buttonLabel: "Volg NSMBL",
      url: "https://whatsapp.com/channel/0029Vb8UXJP4dTnKYrQy590u",
    },
  },
  "manners.nl": {
    enabled: true,
    name: "Manners",
    heading: "Meer Manners in je Google?",
    subtext: "Maak ons je voorkeursbron, dan zie je het beste altijd bovenaan.",
    buttonLabel: "Instellen →",
    googleQuery: "manners.nl",
    theme: "dark",
  },
  "jmouders.nl": {
    enabled: true,
    name: "J/M Ouders",
    heading: "Meer J/M Ouders in je Google?",
    subtext: "Vink ons aan als favoriet en mis onze beste verhalen en adviezen niet.",
    buttonLabel: "Instellen →",
    googleQuery: "jmouders.nl",
  },
  "want.nl": {
    enabled: true,
    name: "WANT",
    heading: "Meer WANT in je feed? ⚡",
    subtext: "Stel ons in als Google-favoriet, dan staat het laatste technieuws bovenaan.",
    buttonLabel: "Instellen →",
    googleQuery: "want.nl",
    whatsapp: {
      heading: "Niks van WANT missen? ⚡",
      subtext: "Alles over tech, van tips tot het laatste nieuws. Volg ons op WhatsApp.",
      buttonLabel: "Volg WANT",
      url: "https://whatsapp.com/channel/0029Va8z27KC1Fu37HCgQH3J",
    },
  },
};

/** Zoekt de config voor een host op; normaliseert een leidende "www.". */
export function lookupSite(hostname: string): SiteConfig | undefined {
  return SITES[hostname.replace(/^www\./, "").toLowerCase()];
}
