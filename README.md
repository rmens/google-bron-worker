# google-bron-worker

Eén Cloudflare Worker die op meerdere Mediahuis-sites (resport.nl, culy.nl, …)
via `HTMLRewriter` een "aanjager"-CTA injecteert direct ná de eerste alinea
binnen het `<article class="single">` op artikelpagina's. Standaard is dat een
Google-"voorkeursbron"-blok; sites met een `whatsapp`-config draaien een
50/50-a/b-test met een "Volg ons op WhatsApp"-blok in dezelfde opmaak.

## Hoe het werkt

De Worker draait als route vóór de origin van elke geconfigureerde zone:

1. De host wordt opgezocht in [`src/sites.ts`](src/sites.ts) (een leidende
   `www.` wordt genegeerd). Onbekende hosts gaan ongewijzigd door.
2. Requests op de klikpaden krijgen een `302`: `/__google-aanjager/click` naar
   de Google-voorkeursbron van die site, `/__aanjager/click-whatsapp` naar het
   WhatsApp-kanaal (zie *Kliks tellen*).
3. Niet-`GET`-requests worden ongewijzigd doorgelaten.
4. De origin-respons wordt opgehaald. Een subrequest naar dezelfde route
   triggert de Worker niet opnieuw, dus er ontstaat geen loop.
5. Alleen responses met `content-type: text/html` worden door `HTMLRewriter`
   gestuurd.
6. De selector (default `article.single p`) matcht alleen op single-artikel­
   pagina's. Het blok komt ná de **eerste** `<p>` (de eerste content-alinea —
   de meta-/social-/figure-blokken bevatten zelf geen `<p>`). Op andere pagina's
   matcht de selector niets en blijft de pagina ongewijzigd.

De transformatie is streaming: de respons-body wordt niet in het geheugen
geladen.

## Een site toevoegen

1. Voeg een entry toe in [`src/sites.ts`](src/sites.ts), met sleutel = het
   geregistreerde domein zonder `www.`:

   ```ts
   "voorbeeld.nl": {
     name: "Voorbeeld",
     heading: "Voorbeeld bovenaan in Google?",
     subtext: "…",
     buttonLabel: "Instellen →",
     googleQuery: "voorbeeld.nl",
     // selector: "…",  // optioneel, als de structuur afwijkt
   },
   ```

2. Voeg in [`wrangler.jsonc`](wrangler.jsonc) een route toe voor de zone
   (zowel apex als `www.` als de site `www` gebruikt).
3. Verifieer de structuur van een artikel (`curl_chromeNNN <artikel-url>`) als
   de site geen standaard `article.single` gebruikt; zet dan een `selector` in
   de config.

Per site zijn de teksten (`heading`, `subtext`, `buttonLabel`) en het
Google-domein (`googleQuery`) los instelbaar. De CSS en de logo's zijn
gedeeld en staan in [`src/injected-block.ts`](src/injected-block.ts).

### A/b-test met een WhatsApp-blok

Geef een site een `whatsapp`-config om het Google-blok per pageview 50/50 af
te wisselen met een WhatsApp-variant (zelfde opmaak, groene knop en
WhatsApp-logo). Nu alleen actief op jmouders.nl:

```ts
whatsapp: {
  heading: "Volg Voorbeeld op WhatsApp",
  subtext: "…",
  buttonLabel: "Volgen →",
  url: "https://whatsapp.com/channel/…",
},
```

Zonder `whatsapp`-config toont een site altijd het Google-blok.

## Kliks tellen

De knoppen linken niet rechtstreeks naar buiten, maar naar een intern pad dat
de Worker met een `302` doorstuurt:

- Google-blok: `/__google-aanjager/click` →
  `https://www.google.com/preferences/source?q=<domein-van-de-site>`. (Dit pad
  behoudt zijn oude `google-`-naam: hier hangt de bestaande klikdata aan.)
- WhatsApp-blok: `/__aanjager/click-whatsapp` → de kanaal-URL uit de config.

Elke klik is zo één HTTP-request op dat pad, dat Cloudflare al meetelt in de
zone-/HTTP-analytics — geen aparte tracking-infrastructuur nodig. Het
`__`-prefix zorgt dat het pad nooit met een echt artikel verward wordt.

Aantal kliks opvragen via de [GraphQL Analytics
API](https://developers.cloudflare.com/analytics/graphql-api/) — filter
`httpRequestsAdaptiveGroups` op `clientRequestPath` (een van de twee paden
hierboven) en `clientRequestHTTPHost` op de site. Let op: deze dataset is adaptief gesampled
en heeft beperkte retentie; voor exacte, langdurige tellingen is Workers
Analytics Engine of Logpush nauwkeuriger.

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
