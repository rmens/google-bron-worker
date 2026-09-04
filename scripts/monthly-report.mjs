import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";

import ts from "typescript";

import {
  GOOGLE_CLICK_PATH,
  NEWSLETTER_SUBSCRIBE_PATH,
  WEBSITE_VAN_HET_JAAR_CLICK_PATH,
  WHATSAPP_CLICK_PATH,
  lookupSite,
} from "../src/sites.ts";

const API_BASE_URL = "https://api.cloudflare.com/client/v4";
const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
const DAY_MS = 86_400_000;
// Kortere vensters laten Cloudflare (ABR) een fijnere sampletabel kiezen dan
// settings.maxDuration toestaat; dat verlaagt sampleInterval op deze dunne paden.
const DEFAULT_CHUNK_SECONDS = 7 * 24 * 60 * 60;
const REQUEST_TIMEOUT_MS = 30_000;

// widget = variantsleutel in wrangler.jsonc; pad/methode/status = wat de Worker teruggeeft.
const TRACKED_REQUESTS = [
  { widget: "google", path: GOOGLE_CLICK_PATH, method: "GET", status: 302, event: "clicks" },
  { widget: "whatsapp", path: WHATSAPP_CLICK_PATH, method: "GET", status: 302, event: "clicks" },
  { widget: "websiteVanHetJaar", path: WEBSITE_VAN_HET_JAAR_CLICK_PATH, method: "GET", status: 302, event: "clicks" },
  { widget: "newsletter", path: NEWSLETTER_SUBSCRIBE_PATH, method: "POST", status: 200, event: "inschrijvingen" },
];

const SETTINGS_QUERY = `
  query ReportSettings($zoneTag: string) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        settings {
          httpRequestsAdaptiveGroups {
            availableFields
            enabled
            maxDuration
            notOlderThan
          }
        }
      }
    }
  }
`;

const REPORT_QUERY = `
  query MonthlyWidgetReport($zoneTag: string, $filter: filter) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        events: httpRequestsAdaptiveGroups(
          filter: $filter
          limit: 100
          orderBy: [count_DESC]
        ) {
          count
          avg {
            sampleInterval
          }
          dimensions {
            clientRequestHTTPMethodName
            clientRequestPath
            edgeResponseStatus
          }
        }
      }
    }
  }
`;

function usage() {
  console.log(`Gebruik:
  npm run report:monthly
  npm run report:monthly -- 2026-08
  npm run report:monthly -- --last-week
  npm run report:monthly -- --from 2026-08-01 --to 2026-08-15
  npm run report:monthly -- --last-week --include-bots
  npm run report:monthly -- 2026-08 --csv reports/2026-08.csv
  npm run report:monthly -- 2026-08 --dry-run

Standaard wordt de vorige kalendermaand in UTC gerapporteerd.
--last-week gebruikt de vorige volledige maandag t/m zondag in UTC.
Bij --from/--to zijn beide opgegeven datums inclusief.
Standaard telt het rapport alleen verkeer met botManagementDecision=likely_human.
Vereist voor echte API-aanvragen: CLOUDFLARE_API_TOKEN.`);
}

function parseArguments(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      "dry-run": { type: "boolean" },
      "last-week": { type: "boolean" },
      "include-bots": { type: "boolean" },
      from: { type: "string" },
      to: { type: "string" },
      csv: { type: "string" },
    },
  });
  if (values.help) {
    usage();
    process.exit(0);
  }
  if (positionals.length > 1) throw new Error("Geef maximaal één maand op.");

  const [month] = positionals;
  const { from, to } = values;
  if ((from === undefined) !== (to === undefined)) {
    throw new Error("Gebruik --from en --to altijd samen.");
  }
  if ([month, values["last-week"], from].filter((x) => x !== undefined).length > 1) {
    throw new Error("Combineer een maand, --last-week en --from/--to niet.");
  }

  return {
    month,
    from,
    to,
    csvPath: values.csv,
    dryRun: values["dry-run"] ?? false,
    lastWeek: values["last-week"] ?? false,
    includeBots: values["include-bots"] ?? false,
  };
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function utcMidnight(now) {
  return new Date(formatDate(now));
}

// Knipt [start, calendarEnd) af op nu en markeert of de periode al compleet is.
function period(label, start, calendarEnd, now) {
  if (start >= now) throw new Error(`${label} ligt in de toekomst.`);
  const complete = calendarEnd <= now;
  return { label, start, end: complete ? calendarEnd : now, complete };
}

function parseMonth(value, now) {
  const month = value ??
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1)).toISOString().slice(0, 7);
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) throw new Error(`Ongeldige maand: ${month}. Gebruik JJJJ-MM.`);

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  return period(
    month,
    new Date(Date.UTC(year, monthIndex, 1)),
    new Date(Date.UTC(year, monthIndex + 1, 1)),
    now,
  );
}

function parseUtcDate(value, option) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(value);
  if (!match) throw new Error(`${option} verwacht JJJJ-MM-DD, kreeg ${value}.`);

  // Date.UTC rolt 30 februari stilzwijgend door naar maart; controleer de terugvertaling.
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (formatDate(date) !== value) {
    throw new Error(`${option} bevat geen geldige kalenderdatum: ${value}.`);
  }
  return date;
}

function parseDateRange(from, to, now) {
  const start = parseUtcDate(from, "--from");
  const inclusiveEnd = parseUtcDate(to, "--to");
  if (inclusiveEnd < start) throw new Error("--to mag niet vóór --from liggen.");
  if (inclusiveEnd > utcMidnight(now)) throw new Error("--to ligt in de toekomst.");
  return period(
    `${from} t/m ${to}`,
    start,
    new Date(inclusiveEnd.getTime() + DAY_MS),
    now,
  );
}

function previousWeek(now) {
  const today = utcMidnight(now);
  const daysSinceMonday = (today.getUTCDay() + 6) % 7;
  const currentMonday = new Date(today.getTime() - daysSinceMonday * DAY_MS);
  const start = new Date(currentMonday.getTime() - 7 * DAY_MS);
  const inclusiveEnd = new Date(currentMonday.getTime() - DAY_MS);
  return period(
    `${formatDate(start)} t/m ${formatDate(inclusiveEnd)}`,
    start,
    currentMonday,
    now,
  );
}

function selectPeriod(options, now = new Date()) {
  if (options.lastWeek) return previousWeek(now);
  if (options.from !== undefined) return parseDateRange(options.from, options.to, now);
  return parseMonth(options.month, now);
}

async function readWranglerConfig() {
  const source = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");
  const parsed = ts.parseConfigFileTextToJson("wrangler.jsonc", source);
  if (parsed.error) {
    throw new Error(
      `Kan wrangler.jsonc niet lezen: ${ts.flattenDiagnosticMessageText(parsed.error.messageText, "\n")}`,
    );
  }
  return parsed.config;
}

function sitesFromConfig(config) {
  if (!Array.isArray(config.routes)) {
    throw new Error("wrangler.jsonc bevat geen routes-array.");
  }
  const { SITES = {}, NEWSLETTERS } = config.vars ?? {};

  return config.routes.map((route) => {
    const hostname = route.pattern?.replace(/\/\*$/, "");
    const zoneName = route.zone_name;
    if (!hostname || !zoneName) {
      throw new Error("Elke route moet pattern en zone_name bevatten.");
    }
    const site = lookupSite(SITES, hostname, NEWSLETTERS);
    if (!site) throw new Error(`Geen vars.SITES-entry voor route ${hostname}.`);
    return {
      hostname,
      name: site.name,
      zoneName,
      configuredWidgets: new Set(Object.keys(site.variants)),
    };
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, options, attempts = 3) {
  for (let attempt = 1; ; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      if (attempt === attempts) throw error;
      await sleep(500 * 2 ** (attempt - 1));
      continue;
    }
    const body = await response.json().catch(() => undefined);
    if (response.ok) return body;
    if (attempt < attempts && (response.status === 429 || response.status >= 500)) {
      await sleep(500 * 2 ** (attempt - 1));
      continue;
    }
    const detail = body?.errors?.map((error) => error.message).join("; ");
    throw new Error(
      `Cloudflare gaf HTTP ${response.status}${detail ? `: ${detail}` : ""}`,
    );
  }
}

function authorizationHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}

async function findZone(zoneName, token) {
  const query = new URLSearchParams({ name: zoneName });
  const body = await fetchJson(`${API_BASE_URL}/zones?${query}`, {
    headers: authorizationHeaders(token),
  });
  if (!body?.success) {
    throw new Error(`Zone-opzoeking voor ${zoneName} is mislukt.`);
  }
  const exactMatches = body.result.filter((zone) => zone.name === zoneName);
  if (exactMatches.length !== 1) {
    throw new Error(
      `Verwacht precies één Cloudflare-zone voor ${zoneName}, vond ${exactMatches.length}.`,
    );
  }
  return exactMatches[0];
}

async function graphql(query, variables, token) {
  const body = await fetchJson(GRAPHQL_URL, {
    method: "POST",
    headers: authorizationHeaders(token),
    body: JSON.stringify({ query, variables }),
  });
  if (body?.errors?.length) {
    throw new Error(body.errors.map((error) => error.message).join("; "));
  }
  return body?.data;
}

async function datasetSettings(zoneId, token) {
  const data = await graphql(SETTINGS_QUERY, { zoneTag: zoneId }, token);
  const zones = data?.viewer?.zones;
  if (zones?.length !== 1) throw new Error("Analytics-instellingen niet gevonden.");
  return zones[0].settings.httpRequestsAdaptiveGroups;
}

function assertPeriodAvailable(period, settings, zoneName, includeBots) {
  if (!settings.enabled) {
    throw new Error(`httpRequestsAdaptiveGroups is niet beschikbaar voor ${zoneName}.`);
  }
  if (
    !includeBots &&
    !settings.availableFields.includes("dimensions_botManagementDecision")
  ) {
    throw new Error(
      `botManagementDecision is niet beschikbaar voor ${zoneName}; ` +
        "gebruik --include-bots om zonder botfilter te rapporteren.",
    );
  }
  const retentionSeconds = Number(settings.notOlderThan);
  if (!Number.isFinite(retentionSeconds) || retentionSeconds <= 0) {
    throw new Error(`Cloudflare rapporteert geen geldige retentie voor ${zoneName}.`);
  }
  const oldestAvailable = Date.now() - retentionSeconds * 1000;
  if (period.start.getTime() < oldestAvailable) {
    const days = Math.floor(retentionSeconds / 86_400);
    throw new Error(
      `${period.label} valt deels buiten de retentie van ${zoneName} (${days} dagen). ` +
        "Het script stopt om geen onvolledig rapport te tonen.",
    );
  }
}

function createChunks(start, end, maxDurationSeconds) {
  const chunkMilliseconds =
    Math.min(DEFAULT_CHUNK_SECONDS, Number(maxDurationSeconds)) * 1000;
  if (!Number.isFinite(chunkMilliseconds) || chunkMilliseconds <= 0) {
    throw new Error("Cloudflare rapporteert een ongeldige maximale queryduur.");
  }

  const chunks = [];
  for (let cursor = start.getTime(); cursor < end.getTime();) {
    const next = Math.min(cursor + chunkMilliseconds, end.getTime());
    chunks.push([new Date(cursor), new Date(next)]);
    cursor = next;
  }
  return chunks;
}

function emptyTotals() {
  return new Map(
    TRACKED_REQUESTS.map((request) => [
      request.widget,
      { event: request.event, count: 0, maxSampleInterval: 1 },
    ]),
  );
}

function classifyEvent(event) {
  return TRACKED_REQUESTS.find((tracked) =>
    tracked.path === event.dimensions.clientRequestPath &&
    tracked.method === event.dimensions.clientRequestHTTPMethodName &&
    tracked.status === event.dimensions.edgeResponseStatus
  );
}

function addEvents(totals, events) {
  for (const event of events) {
    const tracked = classifyEvent(event);
    if (!tracked) continue;
    const total = totals.get(tracked.widget);
    total.count += event.count;
    total.maxSampleInterval = Math.max(
      total.maxSampleInterval,
      event.avg?.sampleInterval ?? 1,
    );
  }
}

async function querySite(site, period, token, includeBots) {
  const zone = await findZone(site.zoneName, token);
  const settings = await datasetSettings(zone.id, token);
  assertPeriodAvailable(period, settings, site.zoneName, includeBots);

  const baseFilters = [
    { requestSource: "eyeball" },
    { clientRequestHTTPHost: site.hostname },
    { OR: TRACKED_REQUESTS.map((tracked) => ({ clientRequestPath: tracked.path })) },
  ];
  if (!includeBots) baseFilters.push({ botManagementDecision: "likely_human" });

  const totals = emptyTotals();
  for (const [start, end] of createChunks(period.start, period.end, settings.maxDuration)) {
    const filter = {
      AND: [
        { datetime_geq: start.toISOString(), datetime_lt: end.toISOString() },
        ...baseFilters,
      ],
    };
    const data = await graphql(REPORT_QUERY, { zoneTag: zone.id, filter }, token);
    const zones = data?.viewer?.zones;
    if (zones?.length !== 1) {
      throw new Error(`Geen analyticsresultaat voor ${site.hostname}.`);
    }
    addEvents(totals, zones[0].events);
  }

  return [...totals.entries()]
    .filter(([widget, total]) =>
      site.configuredWidgets.has(widget) || total.count > 0
    )
    .map(([widget, total]) => ({
      periode: period.label,
      site: site.name,
      widget,
      gebeurtenis: total.event,
      aantal: Math.round(total.count),
      meetwijze: total.maxSampleInterval > 1 ? "geschat" : "ongesampled",
    }));
}

function escapeCsv(value) {
  const string = String(value);
  return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

function toCsv(rows) {
  const columns = ["periode", "site", "widget", "gebeurtenis", "aantal", "meetwijze"];
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(",")),
  ].join("\n") + "\n";
}

async function writeCsv(csvPath, rows) {
  const resolvedPath = path.resolve(csvPath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, toCsv(rows), "utf8");
  console.log(`\nCSV geschreven naar ${resolvedPath}`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const period = selectPeriod(options);
  const sites = sitesFromConfig(await readWranglerConfig());

  console.log(
    `Rapportperiode: ${period.label} (UTC${period.complete ? "" : `; gegevens t/m ${period.end.toISOString()}`})`,
  );
  console.log(
    `Botfilter: ${options.includeBots ? "uitgeschakeld" : "alleen likely_human"}`,
  );

  if (options.dryRun) {
    console.table(sites.map((site) => ({
      site: site.name,
      hostname: site.hostname,
      zone: site.zoneName,
      widgets: [...site.configuredWidgets].join(", "),
    })));
    return;
  }

  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error("CLOUDFLARE_API_TOKEN is niet ingesteld.");
  }

  console.error(`Cloudflare-analytics ophalen voor ${sites.length} sites...`);
  const rows = (await Promise.all(
    sites.map((site) => querySite(site, period, token, options.includeBots)),
  )).flat();

  console.table(rows);
  if (options.csvPath) await writeCsv(options.csvPath, rows);

  if (rows.some((row) => row.meetwijze === "geschat")) {
    console.log(
      "\nLet op: 'geschat' betekent dat Cloudflare adaptieve sampling heeft toegepast.",
    );
  }
  console.log(
    "Nieuwsbriefinschrijvingen zijn HTTP 200-responses; de honeypot-fallback is daarin inbegrepen.",
  );
}

main().catch((error) => {
  console.error(`Fout: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
