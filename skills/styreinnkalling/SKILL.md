---
name: styreinnkalling
description: Skriv og send innkallingen til styremøtet i Dealbook (et smart dokument) sammen med brukeren: møtet (dato, tid, sted eller møtelenke, behandlingsmåte), de innkalte fra styret og daglig leder, sakslisten med saksframstilling og forslag til vedtak, vedlegg fra arkivet eller weblenker, kontroll mot aksjeloven §§ 6-19 til 6-24, utsending på e-post til styret, og etter møtet protokollen skrevet fra innkallingen. Bruk ved /styreinnkalling, «innkalling til styremøte», «kall inn styret», «saksliste til styremøtet», «send innkallingen» eller «avlys styremøtet».
---

# /styreinnkalling

Styreleder sørger for at styret behandler sakene, og innkallingen er varselet om behandlingen (asl. § 6-22). Den
skal gi alle styremedlemmene anledning til å delta (§ 6-24), og sakene skal være forberedt så styret har et
forsvarlig grunnlag (§ 6-21). I Dealbook er innkallingen et smart dokument: hver endring er en hendelse i en
hash-kjedet logg (hvem, når, hvorfor, kanal), og det du ser er en visning av loggen. Ingenting slettes; feil rettes
ved å ugyldiggjøre med begrunnelse.

Livsløpet: **skriv (draft) → send (sent) → protokollen skrives fra innkallingen**. En sendt innkalling kan endres;
da foreslår veiledningen «Send endret innkalling» (ny runde til alle). Møtet kan avlyses (`cancelled`); avlyses en
innkalling som aldri er sendt, blir den annullert (`void`).

## Verktøy

- **MCP** (`mcp.dealbook.no`): `board_meeting_notice_get` (`view`: `state`, `schema`, `guidance`, `history`,
  `document`, `verify`), `board_meeting_notice_create`, `board_meeting_notice_apply` (også `void` og `revert`;
  `dry_run: true` er forhåndsvisningen), `board_meeting_notice_send` og `board_meeting_notice_cancel`. Lista:
  `list_smart_documents` med `kind: "board_meeting_notice"`. Styret på avtaleparten:
  `get_board` og `update_board`. Protokollen etter møtet: `board_minutes_create` (se `/styreprotokoll`).
- **CLI:** `dealbook styreinnkalling <kommando>` (eller `npx -y @companybook/dealbook styreinnkalling`).
  `dealbook styreinnkalling --help` viser alt. `--json` gir maskinlesbar utdata. Alt som endrer noe er en
  tørrkjøring uten `--yes`, og `send` og `cancel --notify` sender ekte e-poster bare med `--yes`.
- **REST** (`api.dealbook.no/v1/board-meeting-notices`): samme operasjoner (`POST /:id/apply` med `send_notice`,
  `POST /:id/preview`, `GET /:id/guidance`, `GET /:id/documents/:format` …).
- **Datalaget:** `board_meeting_notice_get` med `view: "schema"` eller `dealbook styreinnkalling schema` (JSON Schema for møtet, de
  innkalte, sakene og kommandoene, med regeltabellen). Les det før du bygger en kommando du ikke har brukt før.

Oppsett og nøkkel som i `/dealbook`: `dealbook whoami`; be aldri om nøkkelen i chatten.

## Harde regler

1. **Start med selskapet og styret.** Kall `get_board` for avtaleparten. Mangler styret eller e-postene, rett det
   med brukeren (`update_board`) før du skriver innkallingen; den som mangler e-post, får ikke innkallingen.
2. **Aldri finn på** dato, tid, sted, saker, saksframstillinger eller forslag til vedtak. Alt skal komme fra
   brukeren (eller fra underlag brukeren gir deg). Det som mangler, spør du om. Et forslag til vedtak du formulerer,
   er et utkast brukeren skal godkjenne.
3. **Alltid forhåndsvisning før innføring.** MCP: `board_meeting_notice_apply` med `dry_run: true`. CLI: kjør uten `--yes` først.
   Vis endringen og før inn først etter et eksplisitt ja.
4. **Veiledningen varsler, den stopper ikke.** Funnene (daglig leder ikke innkalt, styremedlem uten e-post, sak uten
   grunnlag, kort varsel, sted eller møtelenke mangler) er merknader. Gå gjennom dem med brukeren før sending;
   brukeren kan sende likevel. Loven har ingen fast frist; styreinstruksen (§ 6-23) kan ha egne regler.
5. **Utsending krever eget ja.** `board_meeting_notice_send` sender ekte e-poster til styret. Vis hvem som får
   innkallingen (`state.invitees` med e-post fra `board_meeting_notice_get`) og merknadene, og kall verktøyet først
   etter at brukeren eksplisitt har sagt ja. `board_meeting_notice_apply` kan ikke sende.
6. **Avlysning med varsel krever også eget ja.** `board_meeting_notice_cancel` med `notify: true` sender beskjed på
   e-post til alle som har fått innkallingen. Vis hvem som får beskjed, og kall det først etter brukerens eksplisitte
   ja. `board_meeting_notice_apply` avviser `cancel_meeting`; avlysningen har bare dette verktøyet.
7. **Konflikt (409)** betyr at noen andre har endret innkallingen, eller at den allerede er sendt til alle. Hent den
   på nytt og spør igjen.
8. Dette er ikke juridisk rådgivning. Veiledningen er et hjelpemiddel; ved tvil, anbefal advokat.

## Arbeidsflyt

1. **Styret.** `get_board`. Bekreft med brukeren hvem som er styreleder, medlemmer, vara og daglig leder, og at
   e-postene er riktige.
2. **Opprett.** `board_meeting_notice_create` med `write_notice`: `company` (orgNr og navn), `meeting` (`date`,
   `startTime`, `endTime`, `form` physical/electronic/hybrid/written, `place` og/eller `videoUrl` med https), og
   gjerne `items`. Uten `invitees` hentes styret fra avtaleparten; uten `items` brukes standardsakene (godkjenning
   av innkalling og dagsorden, forrige protokoll, eventuelt). Saker uten saksnummer nummereres per møte.
   Opprett etter brukerens ja. Planens grense for smarte dokumenter gir feilkode `limit`.
3. **Sakene.** `board_meeting_notice_apply` med `update_notice`. Listene erstattes som helhet: send hele `items` og
   hele `invitees`. En sak har `kind` (orientation, decision, election, approval), `title`, `body`
   (saksframstillingen) og `proposal` (forslag til vedtak; blir utgangspunktet for vedtaket i protokollen). Bruk
   `expectedVersion` fra forrige svar.
4. **Vedlegg.** `link_document` med `agreementId` fra arkivet (`list_agreements`; filene lastes opp av brukeren i
   appen) eller `link_url` med `url` og `title`, begge med valgfri `itemId` for en sak. `unlink_document` fjerner.
5. **Kontroller.** `board_meeting_notice_get` med `view: "guidance"` (eller `board_meeting_notice_apply` med
   `dry_run: true` og `send_notice`): gå gjennom merknadene med brukeren. Vis gjerne PDF-en (`view: "document"` med
   `format: "notice_pdf"`).
6. **Spør om eksplisitt ja.** Vis mottakerne med e-post, dem uten e-post (får den ikke), og merknadene som står
   åpne.
7. **Send.** `board_meeting_notice_send` med `expectedVersion`. Hver mottaker får sakslisten i e-posten og PDF-en
   vedlagt. Svaret har `sending`: `sent`, `withoutEmail` og `failed`. De som feilet, får den ved neste utsending;
   si fra til brukeren.
8. **Endringer etter utsending.** Endre med `update_notice`; veiledningen sier da «Send endret innkalling».
   Send på nytt etter nytt ja: alle med e-post får den endrede.
9. **Etter møtet: protokollen.** Skriv protokollen fra innkallingen med `board_minutes_create` og `write_protocol`
   med `meetingRef: { kind: "board_meeting", id: <innkallingens id> }`. Møtet, de innkalte, sakene (samme id og
   saksnummer) og vedleggene fylles ut; forslagene til vedtak blir utgangspunktet for vedtakene. Fortsett i
   `/styreprotokoll`. Én protokoll per innkalling. En protokoll som alt finnes, kobles med `board_minutes_apply`
   og `set_meeting_ref` (`noticeId`, `prefill: true` for å hente møtet og sakene).

## Avlysning, dokumenter og retting

- **Avlys:** `board_meeting_notice_cancel` (`reason`, `notify`; CLI `dealbook styreinnkalling cancel [--notify]`).
  Med `notify: true` får de som har fått innkallingen, beskjed på e-post (regel 6); `notify: false` avlyser uten e-post.
- `board_meeting_notice_get` med `view: "document"`: `notice_pdf` (merket «Utkast» før utsending), `json` og `markdown`. Tidsreise
  med `version` eller `date`.
- `view: "history"` og `view: "verify"` (regner hash-kjeden på nytt).
- Feilføringer rettes med `void` (bestemte hendelser, `seqs`) eller `revert` via
  `board_meeting_notice_apply` (tilbake til versjon N), begge med begrunnelse og bare etter brukerens eksplisitte ja.
  En utsending eller avlysning kan ikke ugyldiggjøres; e-postene er sendt.
