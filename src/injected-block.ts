// CTA-blok (gedeelde CSS + logo, per-site teksten).
// Google-, WhatsApp- en nieuwsbriefvarianten in dezelfde gedeelde opmaak.

import {
  GOOGLE_CLICK_PATH,
  NEWSLETTER_SCRIPT_PATH,
  NEWSLETTER_SUBSCRIBE_PATH,
  WEBSITE_VAN_HET_JAAR_CLICK_PATH,
  WHATSAPP_CLICK_PATH,
  type SiteConfig,
} from "./sites";

const STYLE = `<style>
.aanjager-cta{
  --aanjager-brand:#0F82F4;--aanjager-brand-dark:#0967c5;--aanjager-ink:#1A1A1A;--aanjager-border:#E2EAF4;
  font-family:'Poppins',sans-serif;color:var(--aanjager-ink);line-height:1.45;
  display:flex;align-items:center;gap:14px;
  background:#fff !important;
  border:1px solid var(--aanjager-border) !important;
  border-radius:10px !important;
  padding:14px 16px !important;
  margin:28px auto !important;
  max-width:600px !important;
  width:auto !important;
  float:none !important;
  box-sizing:border-box !important;
}
.aanjager-cta *,.aanjager-cta *::before,.aanjager-cta *::after{box-sizing:border-box}
.aanjager-cta a{text-decoration:none}
.aanjager-cta .aanjager-g{
  flex:0 0 44px;width:44px;height:44px;border-radius:50%;
  background:#fff;border:1px solid var(--aanjager-border);
  display:flex;align-items:center;justify-content:center;
}
.aanjager-cta .aanjager-g svg{width:26px;height:26px;display:block}
.aanjager-cta .aanjager-copy{flex:1 1 auto;min-width:0;line-height:1.3}
.aanjager-cta .aanjager-copy b{
  display:block;font-size:15.5px;font-weight:700;color:var(--aanjager-ink);margin:0;
  font-family:'Poppins',sans-serif;letter-spacing:-.005em;
}
.aanjager-cta .aanjager-copy span{
  display:block;font-size:13px;color:#5a5f6b;margin-top:2px;font-weight:400;
}
.aanjager-cta .aanjager-btn{
  flex:0 0 auto;
  display:inline-flex;align-items:center;justify-content:center;
  background:var(--aanjager-brand);color:#fff !important;
  font-weight:600;font-size:13.5px;letter-spacing:.01em;
  padding:10px 16px;min-height:40px;
  border-radius:var(--fw3-button-border-radius,6px);
  white-space:nowrap;transition:background .15s;
  text-decoration:none;border:0;font-family:'Poppins',sans-serif;cursor:pointer;
}
.aanjager-cta .aanjager-btn:hover{background:var(--aanjager-brand-dark)}
.aanjager-cta .aanjager-btn:disabled{cursor:wait;opacity:.65}
.aanjager-cta--newsletter{
  --aanjager-brand:var(--fw3-button-background-color,var(--fw3-secondary,#34C600));
  --aanjager-brand-dark:var(--fw3-button-background-color,var(--fw3-secondary,#2DAC00));
  flex-wrap:wrap;row-gap:12px
}
.aanjager-cta--newsletter .aanjager-g{color:var(--aanjager-brand)}
.aanjager-cta--newsletter .aanjager-g svg{width:28px;height:28px}
.aanjager-cta--newsletter .aanjager-copy{flex:1 1 calc(100% - 58px)}
.aanjager-cta .aanjager-newsletter-form{
  display:flex;flex-wrap:wrap;gap:8px;margin:0 0 0 58px;width:calc(100% - 58px)
}
.aanjager-cta .aanjager-newsletter-input{
  flex:1 1 210px;min-width:0;height:44px !important;margin:0 !important;
  border:1px solid var(--aanjager-border) !important;
  border-radius:6px !important;padding:8px 11px !important;background:#fff;color:var(--aanjager-ink);
  font:400 13.5px/1.4 'Poppins',sans-serif;
}
.aanjager-cta .aanjager-newsletter-form .aanjager-btn{
  height:44px !important;min-height:44px;padding-top:0;padding-bottom:0;
}
.aanjager-cta .aanjager-newsletter-input:focus{outline:2px solid var(--aanjager-brand);outline-offset:1px}
.aanjager-cta .aanjager-newsletter-status{
  display:block;flex:1 0 100%;min-height:18px;font-size:12.5px;color:#5a5f6b
}
.aanjager-cta .aanjager-newsletter-status:empty{display:none}
.aanjager-cta .aanjager-newsletter-status[data-state="success"]{color:#16723a}
.aanjager-cta .aanjager-newsletter-status[data-state="error"]{color:#b42318}
.aanjager-cta .aanjager-honeypot{
  position:absolute!important;width:1px!important;height:1px!important;padding:0!important;
  margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;
  white-space:nowrap!important;border:0!important
}
@media(max-width:767px){
  .aanjager-cta{margin-left:20px !important;margin-right:20px !important;max-width:none !important}
}
@media(max-width:520px){
  .aanjager-cta{flex-wrap:wrap;row-gap:12px;padding:14px !important}
  .aanjager-cta .aanjager-copy{flex:1 1 calc(100% - 58px)}
  .aanjager-cta .aanjager-btn{padding:12px 16px;font-size:14px;min-height:44px}
  .aanjager-cta > .aanjager-btn{flex:1 0 100%;width:100%;max-width:none;margin:0}
  .aanjager-cta .aanjager-newsletter-form{margin-left:0;width:100%}
  .aanjager-cta .aanjager-newsletter-form .aanjager-newsletter-input{flex:1 1 0;width:0}
  .aanjager-cta .aanjager-newsletter-form .aanjager-btn{margin:0}
}
@media(max-width:360px){
  .aanjager-cta{gap:12px}
  .aanjager-cta .aanjager-g{flex-basis:40px;width:40px;height:40px}
  .aanjager-cta .aanjager-g svg{width:22px;height:22px}
  .aanjager-cta--newsletter .aanjager-g svg{width:23px;height:23px}
  .aanjager-cta .aanjager-copy b{font-size:14.5px}
  .aanjager-cta .aanjager-copy span{font-size:12.5px}
}
.aanjager-cta--dark{background:#1a1a1a !important;border-color:rgba(255,255,255,.12) !important;color:#ececec}
.aanjager-cta--dark .aanjager-copy b{color:#fff}
.aanjager-cta--dark .aanjager-copy span{color:#a7a7a7}
.aanjager-cta--dark .aanjager-newsletter-input{background:#262626;color:#fff;border-color:rgba(255,255,255,.2)}
.aanjager-cta--dark .aanjager-newsletter-status{color:#a7a7a7}
.aanjager-cta--dark .aanjager-newsletter-status[data-state="success"]{color:#6ee7a0}
.aanjager-cta--dark .aanjager-newsletter-status[data-state="error"]{color:#fda29b}
.aanjager-cta--whatsapp{--aanjager-brand:#25D366;--aanjager-brand-dark:#1DA851}
.aanjager-cta--website-van-het-jaar{
  --aanjager-brand:var(--fw3-button-background-color,var(--fw3-secondary,#0F82F4));
  --aanjager-brand-dark:var(--fw3-button-background-color,var(--fw3-secondary,#0967c5));
}
.aanjager-cta--website-van-het-jaar .aanjager-g{
  color:var(--aanjager-brand);background:#fff;border-color:var(--aanjager-border);
}
.aanjager-cta--website-van-het-jaar .aanjager-wvhj-icon{
  width:25px;height:25px;display:block
}
.aanjager-cta--website-van-het-jaar .aanjager-wvhj-icon--crown{
  transform:translateY(-2px)
}
.aanjager-cta--website-van-het-jaar .aanjager-wvhj-icon--metro{
  width:32px;height:32px
}
.aanjager-cta--newsletter .aanjager-btn,
.aanjager-cta--website-van-het-jaar .aanjager-btn{
  color:var(--fw3-button-text-color,#fff) !important;
  border:1px solid var(--fw3-button-border-color,var(--aanjager-brand));
  font-family:var(--fw3-button-font-family,'Poppins',sans-serif);
  font-size:var(--fw3-button-font-size,13.5px);
  font-weight:var(--fw3-button-font-weight,600);
  letter-spacing:var(--fw3-button-letter-spacing,.01em);
  text-transform:var(--fw3-button-text-transform,none);
}
.aanjager-cta--newsletter .aanjager-btn:hover,
.aanjager-cta--website-van-het-jaar .aanjager-btn:hover{opacity:.9}
</style>`;

const WHATSAPP_SVG = `<svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#25D366" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;

const GOOGLE_SVG = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

const NEWSLETTER_SVG = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="4" y="10" width="40" height="28" rx="7" fill="currentColor"/><path d="m10 16.5 14 11 14-11" fill="none" stroke="var(--fw3-button-text-color,#fff)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const WEBSITE_VAN_HET_JAAR_CROWN_ICON = `<svg class="aanjager-wvhj-icon aanjager-wvhj-icon--crown" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="m3 6 5 4 4-6 4 6 5-4-2 12H5L3 6Zm2 14h14v2H5v-2Z"/></svg>`;

const METRO_GLOBE_ICON = `<svg class="aanjager-wvhj-icon aanjager-wvhj-icon--metro" viewBox="84 5 26 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M97.065 30.835c-7.136 0-12.797-5.52-12.797-12.489 0-6.965 5.66-12.485 12.797-12.485 7.144 0 12.797 5.52 12.797 12.485 0 6.968-5.653 12.49-12.797 12.49zM100.6 8.217c.652.913 1.265 2.01 1.728 3.129a14.81 14.81 0 0 0 2.028-1.053 10.034 10.034 0 0 0-3.756-2.076zm4.76 3.058c-.723.452-1.588.917-2.562 1.346.69 1.783 1.086 3.551 1.192 5.02h4c-.146-2.455-1.08-4.669-2.63-6.364v-.002zm-6.742-3.514a3.494 3.494 0 0 0-.825-.104v4.922a15.408 15.408 0 0 0 3.247-.703 19.58 19.58 0 0 0-2.422-4.115zm2.882 5.343c-1.254.495-2.554.817-3.709.915v3.622h4.757a15.704 15.704 0 0 0-1.048-4.537zm-5.15-5.445c-.256 0-.55.033-.832.104a19.831 19.831 0 0 0-2.416 4.115c1.045.356 2.202.593 3.247.703V7.657v.002zm7.64 11.393c-.072 1.441-.471 3.24-1.194 5.028.976.428 1.84.878 2.563 1.34 1.55-1.691 2.485-3.901 2.63-6.366h-4l.001-.002zm-14.207-8.76c.585.358 1.265.74 2.017 1.054a16.938 16.938 0 0 1 1.732-3.127 10.07 10.07 0 0 0-3.75 2.074zm8.006 8.762v3.622c1.272.133 2.52.44 3.709.913a16.53 16.53 0 0 0 1.049-4.537h-4.758v.002zm-1.442-5.033a13.626 13.626 0 0 1-3.716-.913 15.981 15.981 0 0 0-1.045 4.537h4.761v-3.628.004zm5.944 11.295a14.823 14.823 0 0 1-1.693 3.166 10.085 10.085 0 0 0 3.756-2.076 12.306 12.306 0 0 0-2.063-1.09zM88.776 11.277c-1.552 1.697-2.49 3.909-2.632 6.366h3.999c.104-1.47.505-3.237 1.192-5.02a20.044 20.044 0 0 1-2.56-1.346zm9.012 12.842v4.921c.253 0 .542-.031.827-.104a18.672 18.672 0 0 0 2.38-4.15 15.347 15.347 0 0 0-3.207-.669v.002zm-1.442-5.067h-4.761c.11 1.441.467 2.993 1.045 4.537a14.082 14.082 0 0 1 3.716-.913V19.052zm0 5.067c-1.09.108-2.166.332-3.21.668a19.262 19.262 0 0 0 2.38 4.15c.282.072.577.103.83.103v-4.92zm-6.201-5.067h-4c.142 2.467 1.081 4.677 2.633 6.368.719-.462 1.589-.912 2.56-1.338-.727-1.791-1.122-3.59-1.193-5.028v-.002zm1.695 6.266a12.18 12.18 0 0 0-2.058 1.088 10.12 10.12 0 0 0 3.751 2.076 14.667 14.667 0 0 1-1.693-3.166v.002z"/></svg>`;

export const NEWSLETTER_CLIENT_SCRIPT = `(() => {
  if (window.__aanjagerNewsletterLoaded) return;
  window.__aanjagerNewsletterLoaded = true;
  document.addEventListener("submit", async (event) => {
    const form = event.target.closest?.(".aanjager-newsletter-form");
    if (!form) return;
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    const status = form.querySelector(".aanjager-newsletter-status");
    const setStatus = (message, state = "") => {
      status.textContent = message;
      status.dataset.state = state;
    };
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    setStatus("Bezig met inschrijven…");
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { accept: "application/json" },
        body: new FormData(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Inschrijven is niet gelukt.");
      form.reset();
      setStatus(result.message, "success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Inschrijven is niet gelukt.", "error");
    } finally {
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
})();`;

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type Variant =
  | "google"
  | "whatsapp"
  | "newsletter"
  | "website-van-het-jaar";

interface CtaContent {
  /** Wrapper-modifier inclusief leidende spatie, bijv. " aanjager-cta--whatsapp". */
  modifierCls: string;
  ariaLabel: string;
  svg: string;
  heading: string;
  subtext: string;
  /** Actie-markup na de copy: knop-anker of formulier (al ge-escaped waar nodig). */
  actionHtml: string;
  /** Markup na de wrapper-div, bijv. de script-tag van het formulier. */
  trailingHtml?: string;
}

function ctaButton(href: string, label: string): string {
  return `<a class="aanjager-btn" href="${href}" target="_blank" rel="noopener">${esc(label)}</a>`;
}

// Gedeelde schil (stijl, wrapper, icoon, copy); per variant alleen de invulling.
function renderCta(site: SiteConfig, content: CtaContent): string {
  const darkCls = site.theme === "dark" ? " aanjager-cta--dark" : "";
  return `${STYLE}
<div class="aanjager-cta${content.modifierCls}${darkCls}" role="complementary" aria-label="${esc(content.ariaLabel)}">
  <span class="aanjager-g">${content.svg}</span>
  <span class="aanjager-copy"><b>${esc(content.heading)}</b><span>${esc(content.subtext)}</span></span>
  ${content.actionHtml}
</div>
${content.trailingHtml ?? ""}`;
}

export function buildInjectedHtml(site: SiteConfig, variant: Variant): string {
  if (variant === "website-van-het-jaar" && site.variants.websiteVanHetJaar) {
    const websiteVanHetJaar = site.variants.websiteVanHetJaar;
    return renderCta(site, {
      modifierCls: " aanjager-cta--website-van-het-jaar",
      ariaLabel: `Stem op ${site.name} voor Website van het Jaar 2026`,
      svg: websiteVanHetJaar.icon === "metro-globe"
        ? METRO_GLOBE_ICON
        : WEBSITE_VAN_HET_JAAR_CROWN_ICON,
      heading: websiteVanHetJaar.heading,
      subtext: websiteVanHetJaar.subtext,
      actionHtml: ctaButton(
        WEBSITE_VAN_HET_JAAR_CLICK_PATH,
        websiteVanHetJaar.buttonLabel,
      ),
    });
  }

  if (variant === "whatsapp" && site.variants.whatsapp) {
    const wa = site.variants.whatsapp;
    return renderCta(site, {
      modifierCls: " aanjager-cta--whatsapp",
      ariaLabel: `Volg ${site.name} op WhatsApp`,
      svg: WHATSAPP_SVG,
      heading: wa.heading,
      subtext: wa.subtext,
      actionHtml: ctaButton(WHATSAPP_CLICK_PATH, wa.buttonLabel),
    });
  }

  if (variant === "newsletter" && site.variants.newsletter) {
    const newsletter = site.variants.newsletter;
    return renderCta(site, {
      modifierCls: " aanjager-cta--newsletter",
      ariaLabel: `Schrijf je in voor de nieuwsbrief van ${site.name}`,
      svg: NEWSLETTER_SVG,
      heading: newsletter.heading,
      subtext: newsletter.subtext,
      actionHtml: `<form class="aanjager-newsletter-form" action="${NEWSLETTER_SUBSCRIBE_PATH}" method="post">
    <input class="aanjager-newsletter-input" name="email" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="jouw@email.nl" aria-label="E-mailadres" required>
    <label class="aanjager-honeypot">Laat dit veld leeg<input name="website" type="text" tabindex="-1" autocomplete="off"></label>
    <button class="aanjager-btn" type="submit">${esc(newsletter.buttonLabel)}</button>
    <span class="aanjager-newsletter-status" role="status" aria-live="polite"></span>
  </form>`,
      trailingHtml: `<script src="${NEWSLETTER_SCRIPT_PATH}" defer></script>
`,
    });
  }

  const google = site.variants.google;
  if (variant === "google" && google) {
    return renderCta(site, {
      modifierCls: "",
      ariaLabel: `Maak ${site.name} een voorkeursbron in Google`,
      svg: GOOGLE_SVG,
      heading: google.heading,
      subtext: google.subtext,
      actionHtml: ctaButton(GOOGLE_CLICK_PATH, google.buttonLabel),
    });
  }

  // index.ts vangt dit op en serveert dan de originpagina ongewijzigd.
  throw new Error(`Variant ${variant} ontbreekt voor ${site.name}`);
}
