# google-bron-worker

Eén Cloudflare Worker die op meerdere Mediahuis-sites (resport.nl, culy.nl, …)
via `HTMLRewriter` een "aanjager"-CTA injecteert direct ná de eerste alinea
binnen het `<article class="single">` op artikelpagina's. Per site kunnen de
Google-, WhatsApp-, nieuwsbrief- en Website van het Jaar-varianten afzonderlijk
worden geconfigureerd en aan- of uitgezet. Alle ingeschakelde varianten worden
per pageview met gelijke kans gekozen.

## Hoe het werkt

De Worker draait als route vóór de origin van elke geconfigureerde zone:

1. De host wordt opgezocht in `vars.SITES` en gecombineerd met de eventuele
   nieuwsbriefconfiguratie uit `vars.NEWSLETTERS` in
   [`wrangler.jsonc`](wrangler.jsonc) (een leidende `www.` wordt genegeerd).
   Onbekende hosts gaan ongewijzigd door.
2. Requests op de klikpaden krijgen een `302`: `/__google-aanjager/click` naar
   de Google-voorkeursbron van die site, `/__aanjager/click-whatsapp` naar het
   WhatsApp-kanaal en `/__aanjager/click-website-van-het-jaar` naar de
   persoonlijke stempagina (zie *Kliks tellen*).
3. Een `POST` op `/__aanjager/subscribe-newsletter` wordt server-side naar
   Echobox gestuurd; andere niet-`GET`-requests gaan ongewijzigd door.
4. De origin-respons wordt opgehaald. Een subrequest naar dezelfde route
   triggert de Worker niet opnieuw, dus er ontstaat geen loop.
5. Alleen responses met `content-type: text/html` worden door `HTMLRewriter`
   gestuurd.
6. De gedeelde selector `article.single[data-type="post"] > *` verwerkt alleen
   directe kinderen van een regulier artikel. De injector zoekt de eerste echte
   `<p>`, slaat een "In het kort"-samenvatting over en plaatst het blok vóór het
   eerstvolgende directe kind. Als zo'n volgend element ontbreekt, of op andere
   pagina's, blijft de pagina ongewijzigd.
7. Als `dataLayer[0].Tags` de losse tag `nopromo` bevat, wordt het blok niet
   geïnjecteerd. Dit geldt ook wanneer de tag met andere tags in de
   kommagescheiden waarde staat.

De transformatie is streaming: de respons-body wordt niet in het geheugen
geladen.

## Een site toevoegen

Alle site- en routeconfiguratie staat in [`wrangler.jsonc`](wrangler.jsonc).

1. Voeg onder `vars.SITES` een entry toe met als sleutel het geregistreerde
   domein zonder `www.`:

   ```jsonc
   "voorbeeld.nl": {
     "enabled": true,
     "name": "Voorbeeld",
     "variants": {
       "google": {
         "enabled": true,
         "heading": "Voorbeeld bovenaan in Google?",
         "subtext": "…",
         "buttonLabel": "Instellen →",
         "query": "voorbeeld.nl"
       }
     }
   },
   ```

2. Voeg in hetzelfde bestand een route toe voor iedere host waarop de Worker
   moet draaien, bijvoorbeeld apex en/of `www`.
3. Verifieer dat artikelen de gedeelde selector
   `article.single[data-type="post"] > *` gebruiken. Een site met een afwijkende
   artikelstructuur vraagt momenteel om een wijziging aan de injectielogica; er
   is geen selector per site.

`enabled` op siteniveau is de hoofdschakelaar. Binnen `variants` heeft iedere
variant een eigen `enabled`; Google is dus niet verplicht. Als geen enkele
variant actief is, wordt niets geïnjecteerd. `src/sites.ts` bevat alleen de
bijbehorende TypeScript-typen, gedeelde paden en hostname-lookup. De CSS en de
logo's staan in [`src/injected-block.ts`](src/injected-block.ts).

### A/B-test met een WhatsApp-blok

Geef een site onder `variants` een `whatsapp`-config om die variant toe te voegen
(zelfde opmaak, groene knop en WhatsApp-logo):

```jsonc
"whatsapp": {
  "enabled": true,
  "heading": "Volg Voorbeeld op WhatsApp",
  "subtext": "…",
  "buttonLabel": "Volgen →",
  "url": "https://whatsapp.com/channel/…"
},
```

Iedere ingeschakelde variant wordt per pageview met gelijke kans gekozen.

### Website van het Jaar

Geef een site onder `variants` een `websiteVanHetJaar`-config om de
campagnevariant mee te laten draaien. De persoonlijke stempagina en eventuele
sitespecifieke icoonkeuze blijven in de siteconfig staan; de SVG-assets staan in
`src/injected-block.ts`. De styling gebruikt de `--fw3-button-*`-tokens van
de actieve site, met `--fw3-secondary` als fallback voor de huisstijlkleur.

```jsonc
"websiteVanHetJaar": {
  "enabled": false,
  "heading": "Stem op Voorbeeld. Win bol.com-tegoed.",
  "subtext": "Samen maken we Voorbeeld Website van het Jaar 2026.",
  "buttonLabel": "Stem nu",
  "url": "https://www.websitevhjaar.nl/participants/voorbeeld",
  "icon": "crown"
},
```

Zet `enabled` pas op `true` wanneer de publieksstemming geopend is. Deze vlag
bepaalt alleen of de variant wordt getoond; zolang de configuratie bestaat,
blijft het bijbehorende klikpad werken.

### Nieuwsbrief via Echobox

De browser praat alleen met de Worker. De Worker wisselt de per-property
`CLIENT_ID` en `REFRESH_TOKEN` om voor Echobox identity tokens, haalt daarmee
een kortlevende Email Client Service Token op en roept daarna de
campagne-inschrijfroute aan. Identity- en service-tokens worden in de Worker-
isolate gecachet; secrets en tokens komen nooit in de geïnjecteerde HTML.
Na een geslaagde inschrijving zet de Worker een jaar lang een cookie
(`__aanjager-newsletter-subscribed`), zodat die bezoeker de nieuwsbriefvariant niet meer
te zien krijgt en terugvalt op de overige varianten.

Voeg onder `vars.NEWSLETTERS` een nieuwsbriefconfig toe met het geregistreerde
domein als sleutel. De aparte binding houdt zowel de site- als
nieuwsbriefconfiguratie onder Cloudflares limiet van 5 KiB per binding:

```jsonc
"voorbeeld.nl": {
  "enabled": true,
  "heading": "Elke dag het beste van Voorbeeld",
  "subtext": "Ontvang het laatste nieuws direct in je inbox.",
  "buttonLabel": "Inschrijven",
  "campaignUrn": "urn:newsletter:campaign:UUID-UIT-ECHOBOX",
  "credentialBindingPrefix": "ECHOBOX_VOORBEELD"
},
```

Maak de API-credentials in Echobox aan via **Settings → Property → API** en zet
ze als Cloudflare-secrets. De prefix uit de siteconfig bepaalt de bindingsnamen:

```bash
npx wrangler secret put ECHOBOX_VOORBEELD_CLIENT_ID
npx wrangler secret put ECHOBOX_VOORBEELD_REFRESH_TOKEN
```

Declareer beide namen ook onder `secrets.required` in `wrangler.jsonc`, zodat
Wrangler een upload of deploy weigert als een binding ontbreekt.

Voor lokaal gebruik kun je `.dev.vars.example` kopiëren naar `.dev.vars` en de
waarden invullen. `.dev.vars` staat in `.gitignore` en mag niet worden gecommit.
Zie de [Echobox-authenticatie](https://docs.echobox.com/reference/authentication),
de [Email Client Service Token-flow](https://docs.echobox.com/reference/getting-started-email)
en de [campaign subscribe-endpoint](https://docs.echobox.com/reference/endpoints-subscribe-unsubscribe-from-a-campaign).

## Kliks tellen

De knoppen linken niet rechtstreeks naar buiten, maar naar een intern pad dat
de Worker met een `302` doorstuurt:

- Google-blok: `/__google-aanjager/click` →
  `https://www.google.com/preferences/source?q=<domein-van-de-site>`. (Dit pad
  behoudt zijn oude `google-`-naam: hier hangt de bestaande klikdata aan.)
- WhatsApp-blok: `/__aanjager/click-whatsapp` → de kanaal-URL uit de config.
- Website van het Jaar-blok: `/__aanjager/click-website-van-het-jaar` → de
  persoonlijke stempagina uit de config.

Elke klik is zo één HTTP-request op dat pad, dat Cloudflare al meetelt in de
zone-/HTTP-analytics — geen aparte tracking-infrastructuur nodig. Het
`__`-prefix zorgt dat het pad nooit met een echt artikel verward wordt.

Aantal kliks opvragen via de [GraphQL Analytics
API](https://developers.cloudflare.com/analytics/graphql-api/) — filter
`httpRequestsAdaptiveGroups` op `clientRequestPath` (een van de klikpaden
hierboven) en `clientRequestHTTPHost` op de site. Let op: deze dataset is adaptief gesampled
en heeft beperkte retentie; voor exacte, langdurige tellingen is Workers
Analytics Engine of Logpush nauwkeuriger.

### Maandrapport

`scripts/monthly-report.mjs` vraagt de interne redirectpaden en succesvolle
nieuwsbrief-POST's per site op. Zonder argument rapporteert het script de vorige
UTC-kalendermaand; geef `JJJJ-MM` mee voor een andere maand:

```bash
npm run report:monthly
npm run report:monthly -- 2026-08
npm run report:monthly -- --last-week
npm run report:monthly -- --from 2026-08-01 --to 2026-08-15
npm run report:monthly -- --last-week --include-bots
npm run report:monthly -- 2026-08 --csv reports/2026-08.csv
```

`--last-week` rapporteert de vorige volledige maandag tot en met zondag.
`--from` en `--to` accepteren datums in `JJJJ-MM-DD`; beide grensdatums worden
meegenomen. Alle perioden gebruiken UTC.

Standaard telt het rapport alleen requests die Cloudflare als `likely_human`
classificeert. Daarmee blijven verified bots en waarschijnlijk geautomatiseerd
verkeer buiten de cijfers. Gebruik `--include-bots` om de botfilter voor een
controlemeting uit te schakelen.

Stel `CLOUDFLARE_API_TOKEN` in met deze alleen-lezen rechten:

- `Account / Account Analytics / Read` voor de GraphQL Analytics API;
- `Zone / Zone / Read` om de zone-ID's uit de `zone_name`-waarden op te zoeken;
- toegang tot alle zones die onder `routes` in `wrangler.jsonc` staan.

Het script gebruikt `wrangler.jsonc` als bron voor sites, hostnames en widgets
en importeert de klikpaden uit `src/sites.ts`, zodat beide niet uit elkaar lopen.
Het vraagt de data in korte perioden op, telt alleen eindgebruikersrequests en
stopt als een deel van de maand buiten Cloudflares retentie valt. Een `302` op
een klikpad telt als klik; een `200` op de nieuwsbrief-POST telt als
inschrijving. De bestaande honeypot geeft bots bewust ook een `200`, zodat die
antwoorden niet van echte inschrijvingen te onderscheiden zijn in HTTP
Analytics. Gebruik `--dry-run` om zonder token de geselecteerde sites en widgets
te controleren.

## Lokaal draaien

```bash
npm install
npm run dev        # wrangler dev — lokale preview
npm run typecheck  # tsc --noEmit
```

## Deployen

Alle doelzones moeten op hetzelfde Cloudflare-account staan; de routes in
[`wrangler.jsonc`](wrangler.jsonc) verwijzen naar die zones. Eén deploy dekt
alle sites.

```bash
npx wrangler login   # eenmalig
npm run deploy       # wrangler deploy
```
