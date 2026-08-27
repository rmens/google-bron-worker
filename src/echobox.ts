const AUTH_URL = "https://auth.echobox.com/oauth2/token";
const EMAIL_API_URL = "https://prod.campaignapi.service.echobox.com";
const IDENTITY_EXPIRY_MARGIN_MS = 60_000;
const CST_VALIDITY_SECONDS = 300;
const CST_EXPIRY_MARGIN_MS = 30_000;
const REQUEST_TIMEOUT_MS = 10_000;

export interface EchoboxCredentials {
  clientId: string;
  refreshToken: string;
}

interface IdentityTokens {
  idToken: string;
  accessToken: string;
  expiresAt: number;
}

interface ClientServiceToken {
  value: string;
  expiresAt: number;
}

interface IdentityResponse {
  id_token?: unknown;
  access_token?: unknown;
  expires_in?: unknown;
}

// Per-isolate tokencache met dedup van gelijktijdige verversingen per sleutel.
class TokenStore<T extends { expiresAt: number }> {
  private readonly cache = new Map<string, T>();
  private readonly pending = new Map<string, Promise<T>>();

  delete(key: string): void {
    this.cache.delete(key);
  }

  async get(key: string, create: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached;

    const pending = this.pending.get(key);
    if (pending) return pending;

    const request = create();
    this.pending.set(key, request);

    try {
      const value = await request;
      this.cache.set(key, value);
      return value;
    } finally {
      if (this.pending.get(key) === request) this.pending.delete(key);
    }
  }
}

const identityTokens = new TokenStore<IdentityTokens>();
const clientServiceTokens = new TokenStore<ClientServiceToken>();

// De client-ID is voor meerdere properties gelijk; de refresh token maakt de
// credentials uniek. Zonder beide delen kan een property een token uit de
// cache van een andere property hergebruiken.
function credentialCacheKey(credentials: EchoboxCredentials): string {
  return `${credentials.clientId}\0${credentials.refreshToken}`;
}

function fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
  return fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
}

async function requestIdentityTokens(
  credentials: EchoboxCredentials,
): Promise<IdentityTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: credentials.clientId,
    refresh_token: credentials.refreshToken,
  });
  const response = await fetchWithTimeout(AUTH_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Echobox-authenticatie gaf HTTP ${response.status}`);
  }

  const payload: IdentityResponse = await response.json();
  if (
    typeof payload.id_token !== "string" ||
    typeof payload.access_token !== "string" ||
    typeof payload.expires_in !== "number"
  ) {
    throw new Error("Echobox-authenticatie gaf een ongeldig antwoord");
  }

  return {
    idToken: payload.id_token,
    accessToken: payload.access_token,
    expiresAt:
      Date.now() + Math.max(0, payload.expires_in * 1000 - IDENTITY_EXPIRY_MARGIN_MS),
  };
}

function getIdentityTokens(
  credentials: EchoboxCredentials,
  forceRefresh = false,
): Promise<IdentityTokens> {
  const key = credentialCacheKey(credentials);
  if (forceRefresh) identityTokens.delete(key);
  return identityTokens.get(key, () => requestIdentityTokens(credentials));
}

// Eén nieuwe poging met verse tokens wanneer Echobox de vorige met 401 afwijst.
async function sendWithFreshTokenOn401<T>(
  getToken: (forceRefresh?: boolean) => Promise<T>,
  send: (token: T) => Promise<Response>,
): Promise<Response> {
  let response = await send(await getToken());
  if (response.status === 401) {
    response = await send(await getToken(true));
  }
  return response;
}

async function requestClientServiceToken(
  identity: IdentityTokens,
): Promise<Response> {
  return fetchWithTimeout(`${EMAIL_API_URL}/v1/serviceauth`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-EBX-IdToken": identity.idToken,
      "X-EBX-AccessToken": identity.accessToken,
    },
    body: JSON.stringify({ maxValidSecs: CST_VALIDITY_SECONDS }),
  });
}

async function createClientServiceToken(
  credentials: EchoboxCredentials,
): Promise<ClientServiceToken> {
  const response = await sendWithFreshTokenOn401(
    (forceRefresh) => getIdentityTokens(credentials, forceRefresh),
    requestClientServiceToken,
  );

  if (!response.ok) {
    throw new Error(`Echobox-serviceauth gaf HTTP ${response.status}`);
  }

  const value = response.headers.get("X-EBX-ClientServiceToken");
  if (!value) {
    throw new Error("Echobox-serviceauth gaf geen Client Service Token");
  }

  return {
    value,
    expiresAt:
      Date.now() + CST_VALIDITY_SECONDS * 1000 - CST_EXPIRY_MARGIN_MS,
  };
}

function getClientServiceToken(
  credentials: EchoboxCredentials,
  forceRefresh = false,
): Promise<ClientServiceToken> {
  const key = credentialCacheKey(credentials);
  if (forceRefresh) clientServiceTokens.delete(key);
  return clientServiceTokens.get(key, () => createClientServiceToken(credentials));
}

async function sendSubscription(
  campaignUrn: string,
  email: string,
  token: ClientServiceToken,
): Promise<Response> {
  const url = `${EMAIL_API_URL}/v1/public/campaigns/${encodeURIComponent(campaignUrn)}/manage-subscribers/integration`;
  return fetchWithTimeout(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "X-EBX-ClientServiceToken": token.value,
    },
    body: JSON.stringify({ event: "subscribe", email }),
  });
}

export async function subscribeWithEchobox(
  credentials: EchoboxCredentials,
  campaignUrn: string,
  email: string,
): Promise<void> {
  const response = await sendWithFreshTokenOn401(
    (forceRefresh) => getClientServiceToken(credentials, forceRefresh),
    (token) => sendSubscription(campaignUrn, email, token),
  );

  if (!response.ok) {
    throw new Error(`Echobox-inschrijving gaf HTTP ${response.status}`);
  }
}
