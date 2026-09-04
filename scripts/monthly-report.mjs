import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const API_BASE_URL = "https://api.cloudflare.com/client/v4";
const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
const DEFAULT_CHUNK_SECONDS = 7 * 24 * 60 * 60;

const TRACKED_REQUESTS = [
  {
    path: "/__google-aanjager/click",
    method: "GET",
    status: 302,
    widget: "google",
    event: "clicks",
  },
  {
    path: "/__aanjager/click-whatsapp",
    method: "GET",
    status: 302,
    widget: "whatsapp",
    event: "clicks",
  },
  {
    path: "/__aanjager/click-website-van-het-jaar",
    method: "GET",
    status: 302,
    widget: "website-van-het-jaar",
    event: "clicks",
  },
  {
    path: "/__aanjager/subscribe-newsletter",
    method: "POST",
    status: 200,
    widget: "newsletter",
    event: "inschrijvingen",
  },
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
  let month;
  let csvPath;
  let dryRun = false;
  let lastWeek = false;
  let includeBots = false;
  let from;
  let to;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      usage();
      process.exit(0);
    }
    if (argument === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (argument === "--last-week") {
      lastWeek = true;
      continue;
    }
    if (argument === "--include-bots") {
      includeBots = true;
      continue;
    }
    if (argument === "--from" || argument === "--to") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`${argument} verwacht een datum in JJJJ-MM-DD.`);
      }
      if (argument === "--from") from = value;
      if (argument === "--to") to = value;
      index += 1;
      continue;
    }
    if (argument === "--csv") {
      csvPath = args[index + 1];
      if (!csvPath || csvPath.startsWith("-")) {
        throw new Error("--csv verwacht een bestandspad.");
      }
      index += 1;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new Error(`Onbekende optie: ${argument}`);
    }
    if (month) throw new Error("Geef maximaal één maand op.");
    month = argument;
  }

  if ((from && !to) || (!from && to)) {
    throw new Error("Gebruik --from en --to altijd samen.");
  }
  const periodOptions =
    Number(Boolean(month)) + Number(lastWeek) + Number(Boolean(from));
  if (periodOptions > 1) {
    throw new Error("Combineer een maand, --last-week en --from/--to niet.");
  }

  return { month, csvPath, dryRun, lastWeek, includeBots, from, to };
}

function previousMonth(now) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function parseMonth(value, now = new Date()) {
  const month = value ?? previousMonth(now);
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) throw new Error(`Ongeldige maand: ${month}. Gebruik JJJJ-MM.`);

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const calendarEnd = new Date(Date.UTC(year, monthIndex + 1, 1));
  if (start >= now) throw new Error("De opgegeven maand ligt in de toekomst.");

  const complete = calendarEnd <= now;
  return {
    label: month,
    start,
    end: complete ? calendarEnd : now,
    complete,
  };
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseUtcDate(value, option) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(value);
  if (!match) throw new Error(`${option} verwacht JJJJ-MM-DD, kreeg ${value}.`);

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, monthIndex, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`${option} bevat geen geldige kalenderdatum: ${value}.`);
  }
  return date;
}

function parseDateRange(from, to, now = new Date()) {
  const start = parseUtcDate(from, "--from");
  const inclusiveEnd = parseUtcDate(to, "--to");
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ));
  if (inclusiveEnd < start) throw new Error("--to mag niet vóór --from liggen.");
  if (start >= now) throw new Error("--from ligt in de toekomst.");
  if (inclusiveEnd > today) throw new Error("--to ligt in de toekomst.");

  const calendarEnd = new Date(inclusiveEnd.getTime() + 86_400_000);
  const complete = calendarEnd <= now;
  return {
    label: `${from} t/m ${to}`,
    start,
    end: complete ? calendarEnd : now,
    complete,
  };
}

function previousWeek(now = new Date()) {
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ));
  const daysSinceMonday = (today.getUTCDay() + 6) % 7;
  const currentMonday = new Date(today.getTime() - daysSinceMonday * 86_400_000);
  const start = new Date(currentMonday.getTime() - 7 * 86_400_000);
  const inclusiveEnd = new Date(currentMonday.getTime() - 86_400_000);
  return {
    label: `${formatDate(start)} t/m ${formatDate(inclusiveEnd)}`,
    start,
    end: currentMonday,
    complete: true,
  };
}

function selectPeriod(options, now = new Date()) {
  if (options.lastWeek) return previousWeek(now);
  if (options.from && options.to) {
    return parseDateRange(options.from, options.to, now);
  }
  return parseMonth(options.month, now);
}

async function readWranglerConfig() {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const configPath = path.resolve(scriptDirectory, "../wrangler.jsonc");
  const source = await readFile(configPath, "utf8");
  const parsed = ts.parseConfigFileTextToJson(configPath, source);
  if (parsed.error) {
    throw new Error(
      `Kan wrangler.jsonc niet lezen: ${ts.flattenDiagnosticMessageText(parsed.error.messageText, "\n")}`,
    );
  }
  return parsed.config;
}

function configuredWidgets(config, siteKey) {
  const variants = config.vars?.SITES?.[siteKey]?.variants ?? {};
  const widgets = new Set(Object.keys(variants));
  if (config.vars?.NEWSLETTERS?.[siteKey]) widgets.add("newsletter");
  if (widgets.delete("websiteVanHetJaar")) {
    widgets.add("website-van-het-jaar");
  }
  return widgets;
}

function sitesFromConfig(config) {
  if (!Array.isArray(config.routes)) {
    throw new Error("wrangler.jsonc bevat geen routes-array.");
  }

  return config.routes.map((route) => {
    const hostname = route.pattern?.replace(/\/\*$/, "");
    const zoneName = route.zone_name;
    if (!hostname || !zoneName) {
      throw new Error("Elke route moet pattern en zone_name bevatten.");
    }
    const siteKey = hostname.replace(/^www\./, "").toLowerCase();
    return {
      hostname,
      siteKey,
      zoneName,
      configuredWidgets: configuredWidgets(config, siteKey),
    };
  });
}

async function fetchJson(url, options, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const body = await response.json().catch(() => undefined);
      if (!response.ok) {
        const detail = body?.errors?.map((error) => error.message).join("; ");
        const error = new Error(
          `Cloudflare gaf HTTP ${response.status}${detail ? `: ${detail}` : ""}`,
        );
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      } else {
        return body;
      }
    } catch (error) {
      lastError = error;
      if (error?.retryable === false || attempt === attempts) break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
  }
  throw lastError;
}

function authorizationHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}

async function findZone(zoneName, token) {
  const query = new URLSearchParams({ name: zoneName, match: "all" });
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
    body: JSON.stringify({ query: query.replace(/\s+/g, " ").trim(), variables }),
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
  const maximumSeconds = Number(maxDurationSeconds);
  const chunkMilliseconds = Math.min(
    DEFAULT_CHUNK_SECONDS,
    maximumSeconds,
  ) * 1000;
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
  const chunks = createChunks(period.start, period.end, settings.maxDuration);
  const totals = emptyTotals();

  for (const [start, end] of chunks) {
    const filters = [
      { datetime_geq: start.toISOString(), datetime_lt: end.toISOString() },
      { requestSource: "eyeball" },
      { clientRequestHTTPHost: site.hostname },
      {
        OR: TRACKED_REQUESTS.map((tracked) => ({
          clientRequestPath: tracked.path,
        })),
      },
    ];
    if (!includeBots) {
      filters.push({ botManagementDecision: "likely_human" });
    }
    const filter = { AND: filters };
    const data = await graphql(
      REPORT_QUERY,
      { zoneTag: zone.id, filter },
      token,
    );
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
      site: site.siteKey,
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
  const columns = [
    "periode",
    "site",
    "widget",
    "gebeurtenis",
    "aantal",
    "meetwijze",
  ];
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
  const config = await readWranglerConfig();
  const sites = sitesFromConfig(config);

  console.log(
    `Rapportperiode: ${period.label} (UTC${period.complete ? "" : `; gegevens t/m ${period.end.toISOString()}`})`,
  );
  console.log(
    `Botfilter: ${options.includeBots ? "uitgeschakeld" : "alleen likely_human"}`,
  );

  if (options.dryRun) {
    console.table(sites.map((site) => ({
      site: site.siteKey,
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

  const rows = [];
  for (const site of sites) {
    console.error(`Cloudflare-analytics ophalen voor ${site.hostname}…`);
    rows.push(...await querySite(site, period, token, options.includeBots));
  }

  rows.sort((left, right) =>
    left.site.localeCompare(right.site) || left.widget.localeCompare(right.widget)
  );
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
