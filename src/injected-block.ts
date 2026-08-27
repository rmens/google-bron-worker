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
.aanjager-cta--website-van-het-jaar .aanjager-g .aanjager-wvhj-icon--metro{
  width:32px;height:32px
}
.aanjager-cta--website-van-het-jaar .aanjager-g .aanjager-wvhj-icon--site{
  width:30px;height:30px
}
.aanjager-cta--website-van-het-jaar .aanjager-g .aanjager-wvhj-icon--culy{
  width:34px;height:34px
}
.aanjager-cta--website-van-het-jaar .aanjager-g .aanjager-wvhj-icon--manners{
  width:36px;height:36px
}
.aanjager-cta--website-van-het-jaar .aanjager-g .aanjager-wvhj-icon--nsmbl{
  width:20px;height:20px
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
.aanjager-cta--website-van-het-jaar--nsmbl{
  --aanjager-brand:#4cd1a0;--aanjager-brand-dark:#399773
}
.aanjager-cta--website-van-het-jaar--nsmbl .aanjager-g{
  background:linear-gradient(135deg,#ff94af 0%,#ff690c 100%)
}
</style>`;

const WHATSAPP_SVG = `<svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#25D366" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;

const GOOGLE_SVG = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

const NEWSLETTER_SVG = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="4" y="10" width="40" height="28" rx="7" fill="currentColor"/><path d="m10 16.5 14 11 14-11" fill="none" stroke="var(--fw3-button-text-color,#fff)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const WEBSITE_VAN_HET_JAAR_CROWN_ICON = `<svg class="aanjager-wvhj-icon aanjager-wvhj-icon--crown" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="m3 6 5 4 4-6 4 6 5-4-2 12H5L3 6Zm2 14h14v2H5v-2Z"/></svg>`;

const CULY_SITE_ICON = `<svg class="aanjager-wvhj-icon aanjager-wvhj-icon--site aanjager-wvhj-icon--culy" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="125.33pt" height="125.333pt" viewBox="0 0 125.33 125.333"><g enable-background="new"><g id="Layer-1" data-name="Layer"><clipPath id="aanjager-culy-clip"><path transform="matrix(1,0,0,-1,0,125.333)" d="M 0 125.333 L 125.33 125.333 L 125.33 0 L 0 0 Z "/></clipPath><g clip-path="url(#aanjager-culy-clip)"><path transform="matrix(1,0,0,-1,111.2676,62.6675)" d="M 0 0 C 0 -26.842 -21.762 -48.6 -48.604 -48.602 C -75.444 -48.602 -97.207 -26.84 -97.207 0 C -97.207 26.844 -75.444 48.604 -48.604 48.604 C -21.762 48.604 0 26.844 0 0 " fill="#ea4816"/><path transform="matrix(1,0,0,-1,77.0313,43.6372)" d="M 0 0 C .291 .668 3.932 5.725 3.862 1.025 C 3.832 -1.042 2.964 -3.24 2.32 -5.179 C .731 -9.958 -1.718 -14.397 -4.294 -18.715 C -4.267 -17.147 -4.18 -15.597 -4.108 -14.293 C -3.868 -9.836 -1.781 -4.083 0 0 M -14.369 23.642 C -37.898 23.642 -57.042 4.499 -57.042 -19.03 C -57.042 -42.558 -37.898 -61.701 -14.369 -61.701 C -2.454 -61.701 8.331 -56.787 16.08 -48.885 C 16.17 -48.793 16.258 -48.699 16.347 -48.608 C 17.55 -46.981 18.187 -45.124 17.883 -42.757 C 17.871 -42.676 17.871 -42.6 17.859 -42.518 C 17.415 -39.645 15.346 -37.601 12.868 -36.163 C 11.461 -35.458 9.867 -34.946 8.203 -34.637 C 11.22 -27.975 13.001 -20.694 15.271 -13.731 C 15.494 -13.048 15.291 -12.63 14.917 -12.437 C 14.359 -11.601 12.647 -11.972 12.378 -13.279 C 11.527 -17.405 9.779 -22.316 6.551 -25.216 C 4.518 -27.041 4.888 -21.78 5.041 -20.926 C 5.48 -18.438 6.781 -16.121 7.781 -13.828 C 8.597 -11.963 6.138 -11.213 5.393 -12.909 C 4.235 -15.561 2.964 -18.144 2.381 -20.939 C .48 -25.037 -3.083 -28.402 -3.943 -24.172 C -4.042 -23.691 -4.109 -23.165 -4.164 -22.623 C -2.12 -19.838 -.087 -16.411 1.525 -13.313 C 3.448 -9.621 7.975 -.985 6.378 4.051 C 5.432 7.043 1.26 6.069 -.389 4.036 C -4.576 -1.149 -6.289 -9.381 -6.639 -15.844 C -6.701 -17.009 -6.886 -19.714 -6.716 -22.359 C -7.535 -23.353 -8.458 -24.304 -9.333 -25.136 C -12.164 -27.83 -11.818 -21.949 -11.776 -21.46 C -11.558 -18.809 -10.623 -16.166 -9.871 -13.622 C -9.591 -12.675 -10.092 -12.226 -10.737 -12.191 C -11.436 -11.782 -12.746 -12.211 -13.036 -13.303 C -13.814 -16.196 -14.491 -19.11 -15.716 -21.854 C -16.134 -22.793 -19.195 -27.64 -20.127 -24.906 C -21.214 -21.717 -19.666 -17.033 -18.663 -13.951 C -18.03 -12.002 -20.818 -12.162 -21.339 -13.767 C -21.365 -13.847 -21.396 -13.944 -21.424 -14.029 C -21.45 -14.088 -21.478 -14.144 -21.498 -14.211 C -23.539 -21.232 -31.284 -29.039 -38.975 -27.14 C -45.602 -25.501 -45.463 -15.981 -44.254 -10.945 C -43.173 -6.432 -40.731 -2.197 -37.73 1.26 C -30.74 9.322 -22.966 9.172 -20.767 7.468 C -21.065 7.394 -21.406 7.222 -21.748 6.924 C -22.606 6.342 -22.886 5.056 -22.291 4.23 C -19.272 .025 -14.936 7.158 -19.847 9.628 C -29.259 14.365 -39.015 4.74 -43.083 -1.627 C -48.145 -9.552 -51.108 -23.573 -41.695 -29.175 C -35.121 -33.088 -27.953 -28.085 -23.394 -22.33 C -23.624 -24.881 -23.295 -27.225 -21.66 -28.333 C -19.176 -30.021 -16.318 -26.742 -15.047 -24.824 C -14.91 -24.617 -14.787 -24.403 -14.657 -24.193 C -14.604 -24.991 -14.472 -25.779 -14.236 -26.547 C -13.069 -30.349 -10.031 -28.585 -8.026 -26.947 C -7.479 -26.5 -6.911 -25.942 -6.331 -25.304 C -5.889 -27.323 -5.052 -28.843 -3.517 -28.855 C -.821 -28.875 .857 -27.007 2.113 -24.773 C 2.328 -26.614 3.17 -28.561 5.227 -28.546 C 6.404 -28.539 7.421 -27.933 8.298 -27.096 C 7.438 -29.571 6.499 -32.007 5.392 -34.369 C -1.223 -34.476 -10.287 -39.728 -10.724 -46.517 C -10.89 -49.064 -9.244 -52.279 -5.333 -50.705 C -2.542 -49.582 -.03 -47.06 1.802 -44.937 C 3.388 -43.099 4.735 -41.137 5.921 -39.092 C 5.096 -38.924 4.256 -38.88 3.429 -39.083 C 3.19 -39.14 2.963 -39.221 2.735 -39.3 C 2.145 -40.255 1.521 -41.196 .842 -42.113 C -.054 -43.323 -.93 -44.493 -2.063 -45.529 C -4.091 -47.549 -6.328 -48.848 -7.456 -47.601 C -8.177 -46.804 -7.67 -45.294 -7.066 -44.062 C -6.449 -42.804 -5.45 -41.774 -4.346 -40.933 C -4.185 -40.781 -4.015 -40.645 -3.826 -40.546 C -2.386 -39.475 -.807 -38.694 .855 -38.051 C .989 -37.996 1.125 -37.948 1.261 -37.898 C 1.46 -37.825 1.655 -37.744 1.857 -37.673 C 2.494 -37.452 3.197 -37.317 3.935 -37.255 C 4.874 -37.176 5.871 -37.219 6.87 -37.375 C 12.226 -38.208 17.586 -42.206 14.07 -47.208 C 6.808 -54.539 -3.259 -59.087 -14.369 -59.087 C -36.458 -59.087 -54.43 -41.118 -54.43 -19.03 C -54.43 3.059 -36.458 21.03 -14.369 21.03 C 7.721 21.03 25.691 3.059 25.691 -19.03 C 25.691 -24.605 24.543 -29.917 22.477 -34.744 C 21.885 -36.669 21.09 -39.096 21.515 -42.079 C 25.804 -35.426 28.305 -27.517 28.305 -19.03 C 28.305 4.499 9.16 23.642 -14.369 23.642 " fill="#ffffff"/></g></g></g></svg>`;

const MANNERS_SITE_ICON = `<svg class="aanjager-wvhj-icon aanjager-wvhj-icon--site aanjager-wvhj-icon--manners" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20.335 7.667v2.401l1.762-.796h.847l1.763.797V7.667l-1.76.796h-.851l-1.761-.796Zm7.45.804-5.178 20.496-5.179-20.496H8.625v27.945h5.568V17.35L19.5 36.417h5.955l5.352-19.15v19.15h5.61V8.47h-8.632Z" fill="#1c1a1a"/></svg>`;

const NSMBL_SITE_ICON = `<svg class="aanjager-wvhj-icon aanjager-wvhj-icon--site aanjager-wvhj-icon--nsmbl" viewBox="0 0 27.136 27.833" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13.806 0v13.513L0 0v27.833h27.136V0H13.806Z" fill="#fff"/></svg>`;

const METRO_GLOBE_ICON = `<svg class="aanjager-wvhj-icon aanjager-wvhj-icon--metro" viewBox="84 5 26 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M97.065 30.835c-7.136 0-12.797-5.52-12.797-12.489 0-6.965 5.66-12.485 12.797-12.485 7.144 0 12.797 5.52 12.797 12.485 0 6.968-5.653 12.49-12.797 12.49zM100.6 8.217c.652.913 1.265 2.01 1.728 3.129a14.81 14.81 0 0 0 2.028-1.053 10.034 10.034 0 0 0-3.756-2.076zm4.76 3.058c-.723.452-1.588.917-2.562 1.346.69 1.783 1.086 3.551 1.192 5.02h4c-.146-2.455-1.08-4.669-2.63-6.364v-.002zm-6.742-3.514a3.494 3.494 0 0 0-.825-.104v4.922a15.408 15.408 0 0 0 3.247-.703 19.58 19.58 0 0 0-2.422-4.115zm2.882 5.343c-1.254.495-2.554.817-3.709.915v3.622h4.757a15.704 15.704 0 0 0-1.048-4.537zm-5.15-5.445c-.256 0-.55.033-.832.104a19.831 19.831 0 0 0-2.416 4.115c1.045.356 2.202.593 3.247.703V7.657v.002zm7.64 11.393c-.072 1.441-.471 3.24-1.194 5.028.976.428 1.84.878 2.563 1.34 1.55-1.691 2.485-3.901 2.63-6.366h-4l.001-.002zm-14.207-8.76c.585.358 1.265.74 2.017 1.054a16.938 16.938 0 0 1 1.732-3.127 10.07 10.07 0 0 0-3.75 2.074zm8.006 8.762v3.622c1.272.133 2.52.44 3.709.913a16.53 16.53 0 0 0 1.049-4.537h-4.758v.002zm-1.442-5.033a13.626 13.626 0 0 1-3.716-.913 15.981 15.981 0 0 0-1.045 4.537h4.761v-3.628.004zm5.944 11.295a14.823 14.823 0 0 1-1.693 3.166 10.085 10.085 0 0 0 3.756-2.076 12.306 12.306 0 0 0-2.063-1.09zM88.776 11.277c-1.552 1.697-2.49 3.909-2.632 6.366h3.999c.104-1.47.505-3.237 1.192-5.02a20.044 20.044 0 0 1-2.56-1.346zm9.012 12.842v4.921c.253 0 .542-.031.827-.104a18.672 18.672 0 0 0 2.38-4.15 15.347 15.347 0 0 0-3.207-.669v.002zm-1.442-5.067h-4.761c.11 1.441.467 2.993 1.045 4.537a14.082 14.082 0 0 1 3.716-.913V19.052zm0 5.067c-1.09.108-2.166.332-3.21.668a19.262 19.262 0 0 0 2.38 4.15c.282.072.577.103.83.103v-4.92zm-6.201-5.067h-4c.142 2.467 1.081 4.677 2.633 6.368.719-.462 1.589-.912 2.56-1.338-.727-1.791-1.122-3.59-1.193-5.028v-.002zm1.695 6.266a12.18 12.18 0 0 0-2.058 1.088 10.12 10.12 0 0 0 3.751 2.076 14.667 14.667 0 0 1-1.693-3.166v.002z"/></svg>`;

const WEBSITE_VAN_HET_JAAR_ICONS = {
  crown: WEBSITE_VAN_HET_JAAR_CROWN_ICON,
  "metro-globe": METRO_GLOBE_ICON,
  culy: CULY_SITE_ICON,
  manners: MANNERS_SITE_ICON,
  nsmbl: NSMBL_SITE_ICON,
} as const;

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
    const icon = websiteVanHetJaar.icon ?? "crown";
    return renderCta(site, {
      modifierCls:
        ` aanjager-cta--website-van-het-jaar aanjager-cta--website-van-het-jaar--${icon}`,
      ariaLabel: `Stem op ${site.name} voor Website van het Jaar 2026`,
      svg: WEBSITE_VAN_HET_JAAR_ICONS[icon],
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

  if (variant === "google" && site.variants.google) {
    const google = site.variants.google;
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
