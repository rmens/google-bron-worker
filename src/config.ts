// Siteconfiguratie voor alle ondersteunde domeinen (sleutel: domein zonder
// "www."). Als module gebundeld met de Worker, zodat `satisfies` de vorm bij
// `npm run typecheck` afdwingt en de 5KiB-limiet van var-bindings niet geldt.
// De Cloudflare-routes en Echobox-secretdeclaraties staan in wrangler.jsonc.

import type { SiteConfig } from "./sites";

export const SITES = {
  "resport.nl": {
    enabled: true,
    name: "Resport",
    variants: {
      google: {
        enabled: true,
        heading: "Resport altijd op pole position?",
        subtext:
          "Eén vinkje en wij staan voortaan helemaal vooraan in je Google-feed.",
        buttonLabel: "Instellen →",
        query: "resport.nl",
      },
    },
  },
  "culy.nl": {
    enabled: true,
    name: "Culy",
    variants: {
      google: {
        enabled: true,
        heading: "Meer Culy in je Google? 🥐",
        subtext:
          "Vink ons aan als favoriet, dan staan onze lekkere recepten altijd vooraan.",
        buttonLabel: "Instellen →",
        query: "culy.nl",
      },
      newsletter: {
        enabled: true,
        heading: "Elke dag iets lekkers op tafel 🍽️",
        subtext: "Culy’s recept van de dag maakt je inbox lekkerder.",
        buttonLabel: "Aanmelden",
        campaignUrn: "urn:newsletter:campaign:6b647b3d-0ce7-4fe5-80c2-ee0246c17ade",
        credentialBindingPrefix: "ECHOBOX_CULY",
      },
      websiteVanHetJaar: {
        enabled: true,
        heading: "Stem op Culy en win bol.com-tegoed",
        subtext: "Help ons Website van het Jaar 2026 te worden.",
        buttonLabel: "Stem nu",
        url: "https://www.websitevhjaar.nl/participants/culy",
        icon: "culy",
      },
    },
  },
  "metronieuws.nl": {
    enabled: true,
    name: "Metro",
    variants: {
      google: {
        enabled: true,
        heading: "Sneller bij nieuws dat ertoe doet",
        subtext:
          "Stel Metro in als voorkeursbron en je vindt ons nieuws altijd terug in Google.",
        buttonLabel: "Instellen →",
        query: "metronieuws.nl",
      },
      whatsapp: {
        enabled: true,
        heading: "Metronieuws op WhatsApp",
        subtext:
          "De opvallendste nieuwtjes, mooiste verhalen en handigste tips direct in WhatsApp.",
        buttonLabel: "Volg Metro",
        url: "https://whatsapp.com/channel/0029VaZVwso84Om3u2Bnqd1m",
      },
      newsletter: {
        enabled: true,
        heading: "Het beste van Metro in je inbox",
        subtext:
          "Elke doordeweekse dag onze nieuwsbrief met de mooiste verhalen.",
        buttonLabel: "Aanmelden",
        campaignUrn: "urn:newsletter:campaign:1bd150b3-65ce-408d-834e-eae58e5302db",
        credentialBindingPrefix: "ECHOBOX_METRO",
      },
      websiteVanHetJaar: {
        enabled: false,
        heading: "Stem op Metro en win bol.com-tegoed",
        subtext: "Help ons Website van het Jaar 2026 te worden.",
        buttonLabel: "Stem nu",
        url: "https://www.websitevhjaar.nl/participants/metro",
        icon: "metro-globe",
      },
    },
  },
  "nsmbl.nl": {
    enabled: true,
    name: "NSMBL",
    variants: {
      google: {
        enabled: true,
        heading: "Niks van NSMBL missen? 😍",
        subtext: "Maak ons je Google-favoriet, dan weet jij het zodra het gebeurt.",
        buttonLabel: "Instellen →",
        query: "nsmbl.nl",
      },
      whatsapp: {
        enabled: true,
        heading: "Join NSMBL op WhatsApp 👀",
        subtext:
          "Must-reads, winacties en uitnodigingen voor onze events. Op WhatsApp hoor jij het als eerste van ons.",
        buttonLabel: "Volg NSMBL",
        url: "https://whatsapp.com/channel/0029Vb8UXJP4dTnKYrQy590u",
      },
      newsletter: {
        enabled: true,
        heading: "Jouw woensdag, maar dan beter 💌",
        subtext:
          "Beauty, hotspots, series en shoppingtips, elke woensdag in je inbox.",
        buttonLabel: "Aanmelden",
        campaignUrn: "urn:newsletter:campaign:1da34b9c-c62e-44a1-9dba-a52fcd2407de",
        credentialBindingPrefix: "ECHOBOX_NSMBL",
      },
      websiteVanHetJaar: {
        enabled: true,
        heading: "Stem op NSMBL en win bol.com-tegoed",
        subtext: "Help ons Website van het Jaar 2026 te worden.",
        buttonLabel: "Stem nu",
        url: "https://www.websitevhjaar.nl/participants/nsmbl",
        icon: "nsmbl",
      },
    },
  },
  "manners.nl": {
    enabled: true,
    name: "Manners",
    theme: "dark",
    variants: {
      google: {
        enabled: true,
        heading: "Meer Manners in je Google?",
        subtext: "Maak ons je voorkeursbron, dan zie je het beste altijd bovenaan.",
        buttonLabel: "Instellen →",
        query: "manners.nl",
      },
      newsletter: {
        enabled: true,
        heading: "Manners Weekly in je inbox",
        subtext:
          "Elke vrijdag de beste verhalen over geld, stijl, gezondheid en alles wat mannen beweegt.",
        buttonLabel: "Let's go",
        campaignUrn: "urn:newsletter:campaign:3d0cb072-b4b5-4570-ac6a-e3187a6108cd",
        credentialBindingPrefix: "ECHOBOX_MANNERS",
      },
      websiteVanHetJaar: {
        enabled: true,
        heading: "Stem op Manners en win bol.com-tegoed",
        subtext: "Help ons Website van het Jaar 2026 te worden.",
        buttonLabel: "Stem nu",
        url: "https://www.websitevhjaar.nl/participants/manners",
        icon: "manners",
      },
    },
  },
  "jmouders.nl": {
    enabled: true,
    name: "J/M Ouders",
    variants: {
      google: {
        enabled: true,
        heading: "Meer J/M Ouders in je Google?",
        subtext:
          "Vink ons aan als favoriet en mis onze beste verhalen en adviezen niet.",
        buttonLabel: "Instellen →",
        query: "jmouders.nl",
      },
      whatsapp: {
        enabled: false,
        heading: "J/M Ouders op WhatsApp",
        subtext:
          "Ontvang dagelijks persoonlijke verhalen, praktische opvoedtips en advies van experts.",
        buttonLabel: "Volg J/M Ouders",
        url: "https://www.whatsapp.com/channel/0029VbDgdmp002TFQyqFTj3W",
      },
      newsletter: {
        enabled: true,
        heading: "Opvoeden hoef je niet alleen te doen",
        subtext: "Elk weekend persoonlijke verhalen en opvoedadvies in je inbox.",
        buttonLabel: "Aanmelden",
        campaignUrn: "urn:newsletter:campaign:09bd7ae9-69ff-42ea-b9f7-e64af4a9ef22",
        credentialBindingPrefix: "ECHOBOX_JMOUDERS",
      },
    },
  },
  "want.nl": {
    enabled: true,
    name: "WANT",
    variants: {
      google: {
        enabled: true,
        heading: "Meer WANT in je feed? ⚡",
        subtext:
          "Stel ons in als Google-favoriet, dan staat het laatste technieuws bovenaan.",
        buttonLabel: "Instellen →",
        query: "want.nl",
      },
      whatsapp: {
        enabled: true,
        heading: "Niks van WANT missen? ⚡",
        subtext:
          "Alles over tech, van tips tot het laatste nieuws. Volg ons op WhatsApp.",
        buttonLabel: "Volg WANT",
        url: "https://whatsapp.com/channel/0029Va8z27KC1Fu37HCgQH3J",
      },
      newsletter: {
        enabled: true,
        heading: "Je wekelijkse tech-upgrade 🚀",
        subtext:
          "Elke vrijdag het belangrijkste technieuws en de beste deals in je inbox.",
        buttonLabel: "Aanmelden",
        campaignUrn: "urn:newsletter:campaign:c62c76aa-a2a1-4596-8146-ee45dc8ae9a1",
        credentialBindingPrefix: "ECHOBOX_WANT",
      },
    },
  },
  "bedrock.nl": {
    enabled: true,
    name: "BEDROCK",
    variants: {
      google: {
        enabled: true,
        heading: "Meer BEDROCK, minder zoeken 🧘‍♀️",
        subtext:
          "Vink ons aan als favoriet in Google, dan staan onze beste verhalen vooraan.",
        buttonLabel: "Instellen →",
        query: "bedrock.nl",
      },
      newsletter: {
        enabled: true,
        heading: "Begin je zondag bewust",
        subtext:
          "De beste verhalen over persoonlijke groei, bewust leven en mentale gezondheid in je inbox.",
        buttonLabel: "Aanmelden",
        campaignUrn: "urn:newsletter:campaign:ee7b2156-2cbf-4bef-a9f9-ec40503f8ce4",
        credentialBindingPrefix: "ECHOBOX_BEDROCK",
      },
    },
  },
} satisfies Record<string, SiteConfig>;

/** Zoekt de config voor een host op; normaliseert een leidende "www.". */
export function lookupSite(hostname: string): SiteConfig | undefined {
  const sites: Record<string, SiteConfig> = SITES;
  return sites[hostname.replace(/^www\./, "").toLowerCase()];
}
