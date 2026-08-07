// HTTP-endpoint voor nieuwsbriefinschrijvingen: valideert de aanvraag en
// stuurt die server-side door naar Echobox, zodat secrets nooit de browser bereiken.

import { subscribeWithEchobox } from "./echobox";
import { esc } from "./injected-block";
import { NEWSLETTER_SUBSCRIBED_COOKIE, type SiteConfig } from "./sites";

export interface Env {
  [binding: string]: unknown;
}

const MAX_SUBSCRIPTION_BODY_BYTES = 4_096;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Een jaar geldig; alleen als signaal om de nieuwsbriefvariant over te slaan.
const SUBSCRIBED_COOKIE_VALUE = `${NEWSLETTER_SUBSCRIBED_COOKIE}=1; Max-Age=31536000; Path=/; Secure; SameSite=Lax`;

interface SubscriptionResult {
  ok: boolean;
  message: string;
}

function jsonResponse(body: SubscriptionResult, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

// Een native submit (zonder JavaScript) navigeert naar deze pagina; kale JSON
// is dan geen bruikbare fallback. Het fetch-pad vraagt expliciet om JSON.
function wantsJson(request: Request): boolean {
  return request.headers.get("accept")?.includes("application/json") ?? false;
}

function safeBackUrl(request: Request, expectedOrigin: string): string | undefined {
  const referer = request.headers.get("referer");
  if (!referer) return undefined;
  try {
    return new URL(referer).origin === expectedOrigin ? referer : undefined;
  } catch {
    return undefined;
  }
}

function htmlResponse(message: string, status: number, backUrl?: string): Response {
  const back = backUrl
    ? `<p><a href="${esc(backUrl)}">Terug naar het artikel</a></p>`
    : "";
  return new Response(
    `<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Nieuwsbriefinschrijving</title><body style="font-family:system-ui,sans-serif;max-width:36em;margin:15vh auto 0;padding:0 20px;line-height:1.5"><p>${esc(message)}</p>${back}`,
    {
      status,
      headers: {
        "cache-control": "no-store",
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
}

// Harde bytegrens tijdens het lezen; alleen op Content-Length vertrouwen is te
// omzeilen door de header weg te laten. Geeft null terug bij overschrijding.
async function readBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<Uint8Array | null> {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array(0);

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function readSecret(env: Env, name: string): string | undefined {
  const value = env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function hasInvalidOrigin(request: Request, expectedOrigin: string): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;

  const origin = request.headers.get("origin");
  if (origin === null) return false;

  try {
    return new URL(origin).origin !== expectedOrigin;
  } catch {
    return true;
  }
}

export async function handleNewsletterSubscription(
  request: Request,
  env: Env,
  site: SiteConfig,
  expectedOrigin: string,
): Promise<Response> {
  const asJson = wantsJson(request);
  const respond = (body: SubscriptionResult, status = 200): Response => {
    const response = asJson
      ? jsonResponse(body, status)
      : htmlResponse(body.message, status, safeBackUrl(request, expectedOrigin));
    // Ook op het honeypot-"succes", zodat het antwoord voor bots identiek blijft.
    if (body.ok) response.headers.append("set-cookie", SUBSCRIBED_COOKIE_VALUE);
    return response;
  };

  const newsletter = site.newsletter;
  if (!newsletter) return respond({ ok: false, message: "Niet gevonden." }, 404);

  if (hasInvalidOrigin(request, expectedOrigin)) {
    return respond({ ok: false, message: "Ongeldige aanvraag." }, 403);
  }

  const rawBody = await readBodyWithLimit(request, MAX_SUBSCRIPTION_BODY_BYTES);
  if (rawBody === null) {
    return respond({ ok: false, message: "De aanvraag is te groot." }, 413);
  }

  // Zowel het fetch-pad (FormData) als de native submit-fallback posten form-encoded.
  let form: FormData;
  try {
    form = await new Response(rawBody, {
      headers: { "content-type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    return respond({ ok: false, message: "Ongeldige aanvraag." }, 400);
  }

  // Bots vullen dit verborgen veld vaak in. Geef bewust hetzelfde succesantwoord terug.
  const website = form.get("website");
  if (typeof website === "string" && website.length > 0) {
    return respond({ ok: true, message: "Je inschrijving is ontvangen." });
  }

  const rawEmail = form.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return respond(
      { ok: false, message: "Vul een geldig e-mailadres in." },
      400,
    );
  }

  const clientId = readSecret(
    env,
    `${newsletter.credentialBindingPrefix}_CLIENT_ID`,
  );
  const refreshToken = readSecret(
    env,
    `${newsletter.credentialBindingPrefix}_REFRESH_TOKEN`,
  );
  if (!clientId || !refreshToken) {
    console.error(
      "Nieuwsbriefinschrijving niet geconfigureerd voor",
      site.name,
      newsletter.credentialBindingPrefix,
    );
    return respond(
      { ok: false, message: "Inschrijven is tijdelijk niet beschikbaar." },
      503,
    );
  }

  try {
    await subscribeWithEchobox(
      { clientId, refreshToken },
      newsletter.campaignUrn,
      email,
    );
    return respond({ ok: true, message: "Je inschrijving is ontvangen." });
  } catch (error) {
    console.error("Echobox-inschrijving mislukt voor", site.name, error);
    return respond(
      { ok: false, message: "Inschrijven is niet gelukt. Probeer het later opnieuw." },
      502,
    );
  }
}
