// Bouwt het Google-aanjager CTA-blok (scoped CSS + markup) voor een site.
// De CSS en het Google-logo zijn gedeeld; alleen de teksten verschillen per site.

import { CLICK_PATH, type SiteConfig } from "./sites";

const STYLE = `<style>
.google-aanjager-cta{--google-aanjager-brand:#0F82F4;--google-aanjager-brand-dark:#0967c5;--google-aanjager-ink:#1A1A1A;--google-aanjager-muted:#6B7785;--google-aanjager-border:#E2EAF4;
          font-family:'Poppins',sans-serif;box-sizing:border-box;color:var(--google-aanjager-ink);line-height:1.45;margin:28px 0;max-width:740px}
  .google-aanjager-cta *,.google-aanjager-cta *::before,.google-aanjager-cta *::after{box-sizing:border-box}
  .google-aanjager-cta a{text-decoration:none}
.google-aanjager-cta{
  display:flex;align-items:center;gap:14px;
  background:#fff !important;
  border:1px solid var(--google-aanjager-border) !important;
  border-radius:10px !important;
  padding:14px 16px !important;
  margin:28px auto !important;
  max-width:600px !important;
  width:auto !important;
  float:none !important;
  box-sizing:border-box !important;
}
.google-aanjager-cta .google-aanjager-g{
  flex:0 0 44px;width:44px;height:44px;border-radius:50%;
  background:#fff;border:1px solid var(--google-aanjager-border);
  display:flex;align-items:center;justify-content:center;
}
.google-aanjager-cta .google-aanjager-g svg{width:26px;height:26px;display:block}
.google-aanjager-cta .google-aanjager-copy{flex:1 1 auto;min-width:0;line-height:1.3}
.google-aanjager-cta .google-aanjager-copy b{
  display:block;font-size:15.5px;font-weight:700;color:var(--google-aanjager-ink);margin:0;
  font-family:'Poppins',sans-serif;letter-spacing:-.005em;
}
.google-aanjager-cta .google-aanjager-copy span{
  display:block;font-size:13px;color:#5a5f6b;margin-top:2px;font-weight:400;
}
.google-aanjager-cta .google-aanjager-btn{
  flex:0 0 auto;
  display:inline-flex;align-items:center;justify-content:center;
  background:var(--google-aanjager-brand);color:#fff !important;
  font-weight:600;font-size:13.5px;letter-spacing:.01em;
  padding:10px 16px;min-height:40px;border-radius:6px;
  white-space:nowrap;transition:background .15s;
  text-decoration:none;
}
.google-aanjager-cta .google-aanjager-btn:hover{background:var(--google-aanjager-brand-dark)}
@media(max-width:767px){
  .google-aanjager-cta{margin-left:20px !important;margin-right:20px !important;max-width:none !important}
}
@media(max-width:520px){
  .google-aanjager-cta{flex-wrap:wrap;row-gap:12px;padding:14px !important}
  .google-aanjager-cta .google-aanjager-copy{flex:1 1 calc(100% - 58px)}
  .google-aanjager-cta .google-aanjager-btn{flex:0 0 auto;max-width:240px;margin:0 auto;padding:12px 16px;font-size:14px;min-height:44px}
}
@media(max-width:360px){
  .google-aanjager-cta{gap:12px}
  .google-aanjager-cta .google-aanjager-g{flex-basis:40px;width:40px;height:40px}
  .google-aanjager-cta .google-aanjager-g svg{width:22px;height:22px}
  .google-aanjager-cta .google-aanjager-copy b{font-size:14.5px}
  .google-aanjager-cta .google-aanjager-copy span{font-size:12.5px}
}
</style>`;

const GOOGLE_SVG = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

/** Escapet tekst voor veilige plaatsing in HTML. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Bouwt het volledige in te voegen blok (style + markup) voor een site. */
export function buildInjectedHtml(site: SiteConfig): string {
  return `${STYLE}
<div class="google-aanjager-cta" role="complementary" aria-label="Maak ${esc(site.name)} een voorkeursbron in Google">
  <span class="google-aanjager-g">${GOOGLE_SVG}</span>
  <span class="google-aanjager-copy"><b>${esc(site.heading)}</b><span>${esc(site.subtext)}</span></span>
  <a class="google-aanjager-btn" href="${CLICK_PATH}" target="_blank" rel="noopener">${esc(site.buttonLabel)}</a>
</div>
`;
}
