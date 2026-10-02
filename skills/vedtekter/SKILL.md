---
name: vedtekter
description: Les inn, kontroller og endre selskapets vedtekter i Dealbook (et smart dokument) sammen med brukeren: tolk vedtektene fra PDF eller Word, kryssjekk mot Brønnøysund, lag utkast til endringer med flertallet aksjeloven krever (§§ 5-18 til 5-20), før inn generalforsamlingens vedtak, innsending og registrering, og lag ren PDF, kongelig PDF, sammenligning, innkalling, protokoll og arbeidsark for Samordnet registermelding. Bruk ved /vedtekter, «vedtekter», «vedtektsendring», «endre vedtektene», «forkjøpsrett», «samtykke til aksjeerverv», «kapitalforhøyelse i vedtektene», «hvilket flertall trengs» eller «registrere vedtektsendring».
---

# /vedtekter

Vedtektene er selskapets grunnregler, og i Dealbook er de et smart dokument: hver endring er en hendelse i
en hash-kjedet logg (hvem, når, hvorfor, kanal), og det du ser er en visning av loggen. Ingenting slettes;
feil rettes ved å ugyldiggjøre med begrunnelse. Gjelder AS.

En vedtektsendring går gjennom fire steg: **utkast → vedtatt av generalforsamlingen → sendt til
Foretaksregisteret → registrert**. Endringen gjelder utad først når den er registrert. Dealbook sjekker
Brønnøysund én gang i døgnet og fører registreringen selv når en ny vedtektsdato dukker opp, også for en vedtatt
endring brukeren har sendt inn uten Dealbook. Går en lovfrist ut (§ 10-9, § 12-4), fører den samme daglige
sjekken endringen som bortfalt. Disse to hendelsene kan verken du eller brukeren føre.

## Verktøy

- **CLI:** `dealbook vedtekter <kommando>` (eller `npx -y @companybook/dealbook vedtekter`).
  `dealbook vedtekter --help` viser alt. `--json` gir maskinlesbar utdata. Selskapet kan angis med id,
  organisasjonsnummer eller starten av navnet (`fjordlys`). Alt som endrer noe er en tørrkjøring uten `--yes`.
- **MCP** (`mcp.dealbook.no`): `articles_list`, `articles_get`, `articles_interpret`, `articles_import`,
  `articles_seed_from_companybook`, `articles_create`, `articles_preview`, `articles_apply`,
  `articles_draft_amendment`, `articles_adopt_amendment`, `articles_file_amendment`,
  `articles_mark_registered`, `articles_withdraw_amendment`, `articles_guidance`,
  `articles_recommendations`, `articles_majority`, `articles_history`, `articles_diff`, `articles_verify`,
  `articles_facts`, `articles_document`, `articles_source_url`, `articles_attach_signed_protocol`,
  `articles_void`, `articles_revert`, `articles_archive`, `articles_schema`.
- **REST** (`api.dealbook.no/v1/articles`): samme operasjoner. Blant annet `GET /v1/articles/:id/sources/:documentId`
  (nedlastingslenke til en kildefil) og `POST /v1/articles/:id/amendments/:amendmentId/signed-protocol`
  (legg ved signert protokoll; kropp `{ "agreementId"?: string }`, 201 når den legges ved, 200 når den alt lå der).
- **Datalaget:** `dealbook vedtekter schema` eller `articles_schema` (JSON Schema for klausulene og alle
  kommandoene). Les det før du bygger en klausul eller kommando du ikke har brukt før.

Oppsett og nøkkel som i `/dealbook`: `dealbook whoami`; be aldri om nøkkelen i chatten.

## Harde regler

1. **Start med selskapet.** Spør hvilket selskap det gjelder, og bruk organisasjonsnummeret. Finn det med
   brukeren eller i Companybook; gjett det aldri.
2. **Aldri finn på** ordlyd, beløp, antall aksjer, pålydende, datoer eller stemmetall. Ordlyden i en
   klausul skal være ordrett fra dokumentet eller godkjent av brukeren.
3. **Flertallet regnes av Dealbook.** Send aldri inn hvilket flertall en endring krever; send stemmene og
   les vurderingen (`majority`) i svaret. Står det `needs_review`, kan reglene ikke avgjøre det (fritekst):
   si det til brukeren og anbefal at en advokat ser på det.
4. **Alltid forhåndsvisning før innføring.** CLI: kjør uten `--yes` først. MCP: `articles_preview` eller
   `dry_run: true`. Vis endringene, flertallet og veiledningen, og før inn først etter et eksplisitt ja.
5. **Konflikt (409)** betyr at noen andre har endret vedtektene, eller at selskapet allerede har vedtekter.
   Hent dem på nytt, vis hva som er endret, og spør igjen.
6. **Blokkerende veiledning (✗)** stopper innføringen. Rett årsaken; bare hvis brukeren eksplisitt vil føre
   inn likevel, bruk `--override "<begrunnelse>"` (MCP: `override: { reason }`). Begrunnelsen logges.
7. Dette er ikke juridisk rådgivning. Rådene (`articles_recommendations`) og flertallsvurderingen er
   hjelpemidler; ved tvil, anbefal advokat.

## 1. Finn eller opprett vedtektene

`dealbook vedtekter list`. Finnes de ikke, velg kilde sammen med brukeren:

- **Brukeren har vedtektene (PDF eller Word, maks 3 MB og 30 sider):**
  `dealbook vedtekter interpret <orgnr> --file vedtekter.pdf` (MCP: `articles_interpret` med filen som
  base64). Tolkningen tar 15–60 sekunder og gir hver paragraf med sitat og side, avvik mot Brønnøysund
  (`factChecks`) og advarsler. Gå gjennom avvikene og klausulene med lav sikkerhet med brukeren.
  Tolkningen leser også datoen dokumentet selv oppgir («Sist endret …», `documentDate`). Er vedtektsdatoen i
  Brønnøysund nyere, kommer en advarsel: dokumentet er trolig utdatert, så be brukeren om de nyeste vedtektene
  før du oppretter. Tolkning har en egen grense for antall kall per bruker, felles for nettsiden, API og MCP.
  Får du «for mange kall» (HTTP 429), vent og prøv igjen; ikke prøv i løkke. Opprett med
  `--yes` (MCP: `articles_import` med forslagets `command`). Vil brukeren rette noe først:
  `--out forslag.json`, rett filen, og `dealbook vedtekter import --file forslag.json --yes`.
- **Du har allerede lest vedtektene selv:** bygg klausulene (type, terms og ordrett text, i
  paragrafrekkefølge) og bruk `articles_import` uten `interpretation`. Da brukes ikke Dealbooks tolkning.
- **Ingen fil:** `dealbook vedtekter seed <orgnr>` (MCP: `articles_seed_from_companybook`) rekonstruerer
  vedtektene fra Brønnøysund og lovens standardregler. Si tydelig at grunnlaget er ubekreftet til
  vedtektene er lastet opp.
- **Nytt selskap eller full omskriving:** `articles_create` med `blank_template` og en profil (standard,
  holding, startup_investors, family) gir et utkast fra malen.

Planen har en grense for antall smarte dokumenter (`list` viser «N av M brukt»); feilkode `limit` betyr at
den er nådd.

## 2. Kontroller grunnlaget

`dealbook vedtekter guidance <selskap>` (MCP: `articles_guidance`): minstekravene i § 2-2 (foretaksnavn,
virksomhet, aksjekapital og pålydende), avvik mot Brønnøysund og aksjeeierboken, språk og frister. Tolkede
klausuler er ubekreftet til brukeren har sett på dem; bekreft med `confirm_clauses` (MCP: `articles_apply`)
etter at brukeren har sagt ja. Feiltolkninger rettes med `set_interpretation` eller `correct_baseline`
(krever begrunnelse); det er ikke vedtektsendringer.

## 3. Endre vedtektene

1. **Utkast.** Skriv en fil med det som endres:

   ```json
   { "title": "Forkjøpsrett", "proposed": [ { "type": "preemption", "terms": { "applies": true, "variant": "statutory", "holders": "all", "exemptions": [] }, "text": "Aksjeeierne har forkjøpsrett ved overgang av aksjer etter reglene i aksjeloven." } ] }
   ```

   `dealbook vedtekter amend <selskap> --file endring.json` viser endringene og flertallet; `--yes` lagrer
   utkastet. En klausul uten id erstatter klausulen av samme type, ellers legges den til; `"remove": [id]`
   fjerner. Via MCP (`articles_draft_amendment`) er `proposed` hele det nye settet: ta med de uendrede
   klausulene med id. Flertallet:
   - **§ 5-18:** to tredeler av stemmene og av kapitalen som er representert (vanlige endringer).
   - **§ 5-19:** i tillegg mer enn ni tideler av kapitalen som er representert, når samtykke eller
     forkjøpsrett innføres der vedtektene har fjernet dem, når eierkrav (§ 4-18) innføres, eller når
     utbytteretten reduseres. At innsnevring av unntak regnes likt, er Dealbooks tolkning.
   - **§ 5-20:** samtykke fra alle aksjeeiere, eller alle som berøres når bare noen rammes (f.eks. økte
     plikter, tvungen innløsning).
   - **Aksjeklasser:** forringer endringen en hel klasses rett, må klassen i tillegg stemme for seg (§ 5-18 (2)).
2. **Generalforsamling.** Innkallingen skal ha den eksakte nye ordlyden og sendes minst én uke før
   (§ 5-10): `dealbook vedtekter document <selskap> gf-notice-pdf --meeting-date <dato> [--meeting-time <tt:mm>]
   [--meeting-place <sted>]` (MCP: `articles_document` med `meeting`). Protokollmal før møtet: `gf-protocol-pdf`.
3. **Vedtak.** `dealbook vedtekter adopt <selskap> --date <møtedato> --for <n> --against <n>
   --capital-for <kr> --capital-represented <kr>` (`--written` for skriftlig behandling). Til protokollen:
   `--time`, `--place`, `--chair` (møteleder), `--co-signer` (valgt blant de fremmøtte, § 5-16), og fremmøte,
   innsigelser og protokolltilførsler som `protocol` i `--file`. Spør brukeren; gjett aldri navn fra styret i
   Brønnøysund. Det som mangler, står som tomme linjer i protokollen. Forhåndsvisningen sier om stemmene holder. Ved kapitalforhøyelse må endringen registreres innen 3 måneder (§ 10-9), ved
   nedsettelse innen 2 måneder (§ 12-4), ellers faller vedtaket bort.
   Protokoll sendt til signering i Dealbook legges ved endringen av seg selv når alle har signert. Mangler
   kopien, hent den med `articles_attach_signed_protocol` (gir feil til alle har signert).
4. **Innsending.** Arbeidsarket for Samordnet registermelding: `document <selskap>
   registration-worksheet-pdf`. Etter innsending: `dealbook vedtekter file <selskap> --filed-on <dato>`.
   Fristen er «uten ugrunnet opphold» (foretaksregisterloven § 4-2); kapitalendringer har de harde fristene over.
5. **Registrering.** Dealbook sjekker Brønnøysund hver dag og oppdager den selv, også når endringen bare er
   vedtatt i Dealbook og brukeren sendte meldingen på egen hånd. Har brukeren sett registreringen før oss:
   `dealbook vedtekter registered <selskap> --vedtektsdato <dato>`. Svaret kan ha oppfølging i
   aksjeeierboken (ny kapital, klasse); den føres aldri automatisk, så spør brukeren og bruk `/aksjeeierbok`.

Et utkast som ikke skal gjennomføres trekkes med `articles_withdraw_amendment` (etter brukerens ja).

## 4. Dokumenter, historikk og retting

- `dealbook vedtekter document <selskap> <format>`: `clean-pdf`, `royal-pdf` (forseglet med hash),
  `comparison-pdf` (endringsmerket), `gf-notice-pdf`, `gf-protocol-pdf`, `registration-worksheet-pdf`,
  `json`, `markdown`. Tidsreise med `--version <n>` eller `--date <åååå-mm-dd>`.
- `show <selskap> --view pending` viser vedtektene med vedtatte endringer lagt oppå; `--view in_force` det
  som gjelder internt.
- `history <selskap>`, `diff <selskap> --from 1 --to 4` (eller `--amendment <id>`) og `verify <selskap>`.
- Kildefilene (opplastede vedtekter, protokoll, signert protokoll) står i `state.documents` fra
  `articles_get`. `articles_source_url` gir en nedlastingslenke som varer i 5 minutter; del den ikke videre.
- Feilføringer rettes med `articles_void` (bestemte hendelser) eller `articles_revert` (tilbake til versjon
  N), begge med begrunnelse og bare etter brukerens eksplisitte ja.
