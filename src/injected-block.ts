// CTA-blok (gedeelde CSS + logo, per-site teksten).
// Google-, WhatsApp- en nieuwsbriefvarianten in dezelfde gedeelde opmaak.

import {
  CLICK_PATH,
  NEWSLETTER_SCRIPT_PATH,
  NEWSLETTER_SUBSCRIBE_PATH,
  WHATSAPP_CLICK_PATH,
  type SiteConfig,
} from "./sites";

const STYLE = `<style>
.aanjager-cta{--aanjager-brand:#0F82F4;--aanjager-brand-dark:#0967c5;--aanjager-ink:#1A1A1A;--aanjager-muted:#6B7785;--aanjager-border:#E2EAF4;
          font-family:'Poppins',sans-serif;box-sizing:border-box;color:var(--aanjager-ink);line-height:1.45;margin:28px 0;max-width:740px}
  .aanjager-cta *,.aanjager-cta *::before,.aanjager-cta *::after{box-sizing:border-box}
  .aanjager-cta a{text-decoration:none}
.aanjager-cta{
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
  padding:10px 16px;min-height:40px;border-radius:6px;
  white-space:nowrap;transition:background .15s;
  text-decoration:none;border:0;font-family:'Poppins',sans-serif;cursor:pointer;
}
.aanjager-cta .aanjager-btn:hover{background:var(--aanjager-brand-dark)}
.aanjager-cta .aanjager-btn:disabled{cursor:wait;opacity:.65}
.aanjager-cta--newsletter{flex-wrap:wrap;row-gap:12px}
.aanjager-cta--newsletter .aanjager-copy{flex:1 1 calc(100% - 58px)}
.aanjager-cta .aanjager-newsletter-form{
  display:flex;flex-wrap:wrap;gap:8px;margin:0 0 0 58px;width:calc(100% - 58px)
}
.aanjager-cta .aanjager-newsletter-input{
  flex:1 1 210px;min-width:0;height:40px;border:1px solid var(--aanjager-border);
  border-radius:6px;padding:8px 11px;background:#fff;color:var(--aanjager-ink);
  font:400 13.5px/1.4 'Poppins',sans-serif;
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
  .aanjager-cta .aanjager-btn{flex:0 0 auto;max-width:240px;margin:0 auto;padding:12px 16px;font-size:14px;min-height:44px}
  .aanjager-cta .aanjager-newsletter-form{margin-left:0;width:100%}
  .aanjager-cta .aanjager-newsletter-form .aanjager-btn{margin:0}
}
@media(max-width:360px){
  .aanjager-cta{gap:12px}
  .aanjager-cta .aanjager-g{flex-basis:40px;width:40px;height:40px}
  .aanjager-cta .aanjager-g svg{width:22px;height:22px}
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
</style>`;

const WHATSAPP_SVG = `<svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#25D366" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;

const GOOGLE_SVG = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

const NEWSLETTER_SVG = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="5" y="9" width="38" height="30" rx="5" fill="#0F82F4"/><path d="m9 14 15 12 15-12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="m9 35 11-10m19 10L28 25" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`;

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

export type Variant = "google" | "whatsapp" | "newsletter";

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

function renderVariant(site: SiteConfig, variant: Variant): string {
  if (variant === "whatsapp" && site.whatsapp) {
    const wa = site.whatsapp;
    return renderCta(site, {
      modifierCls: " aanjager-cta--whatsapp",
      ariaLabel: `Volg ${site.name} op WhatsApp`,
      svg: WHATSAPP_SVG,
      heading: wa.heading,
      subtext: wa.subtext,
      actionHtml: `<a class="aanjager-btn" href="${WHATSAPP_CLICK_PATH}" target="_blank" rel="noopener">${esc(wa.buttonLabel)}</a>`,
    });
  }

  if (variant === "newsletter" && site.newsletter) {
    const newsletter = site.newsletter;
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

  return renderCta(site, {
    modifierCls: "",
    ariaLabel: `Maak ${site.name} een voorkeursbron in Google`,
    svg: GOOGLE_SVG,
    heading: site.heading,
    subtext: site.subtext,
    actionHtml: `<a class="aanjager-btn" href="${CLICK_PATH}" target="_blank" rel="noopener">${esc(site.buttonLabel)}</a>`,
  });
}

// De uitkomst is deterministisch per (site, variant); bouw hem dus maar eenmaal
// per isolate in plaats van op elke pageview.
const htmlCache = new Map<SiteConfig, Map<Variant, string>>();

export function buildInjectedHtml(site: SiteConfig, variant: Variant = "google"): string {
  let bySite = htmlCache.get(site);
  if (!bySite) {
    bySite = new Map();
    htmlCache.set(site, bySite);
  }

  let html = bySite.get(variant);
  if (html === undefined) {
    html = renderVariant(site, variant);
    bySite.set(variant, html);
  }
  return html;
}
