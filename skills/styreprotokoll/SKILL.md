---
name: styreprotokoll
description: Skriv, kontroller og send styreprotokollen til signering i Dealbook (et smart dokument) sammen med brukeren: møtet, deltakerne fra styret, sakene med vedtak, stemmer, inhabilitet og dissens, protokollen skrevet fra innkallingen i Dealbook, innkallingen og notatene fra møtet koblet fra arkivet (og utkast fra notatene), kontroll mot minstekravene i aksjeloven § 6-29 og reglene om beslutningsdyktighet og flertall (§§ 6-24 til 6-27), og signering hos styremedlemmene som deltok. Bruk ved /styreprotokoll, «styreprotokoll», «protokoll fra styremøtet», «referat fra styremøte», «styrevedtak», «styret skal signere protokollen» eller «last opp styreprotokoll».
---

# /styreprotokoll

Styret i et AS skal føre protokoll fra hvert styremøte, og den skal signeres av alle styremedlemmene som deltok
(asl. § 6-29). I Dealbook er protokollen et smart dokument: hver endring er en hendelse i en hash-kjedet logg
(hvem, når, hvorfor, kanal), og det du ser er en visning av loggen. Ingenting slettes; feil rettes ved å
ugyldiggjøre med begrunnelse. Gjelder AS og ASA, ANS/DA med styre (sel. § 2-15) og foreninger etter vedtektene.

Livsløpet har tre steg: **skriv (draft) → send til signering (awaiting_signature) → signert (signed)**. Lukking
trengs ikke: `board_minutes_send_for_signing` på et utkast låser innholdet og lager PDF-en i samme kall. `ready` betyr
«klar, ikke sendt» (en opplastet protokoll, eller etter en avvist, utløpt eller trukket runde); en endring da åpner
protokollen igjen av seg selv. Protokollen blir signert av seg selv når alle har signert.

## Verktøy

- **MCP** (`mcp.dealbook.no`): `board_minutes_get` (`view`: `state`, `schema`, `guidance`, `history`, `document`,
  `verify`), `board_minutes_create`, `board_minutes_apply` (alle kommandoene, også `void` og `revert`; `dry_run: true`
  er forhåndsvisningen) og `board_minutes_send_for_signing`. Lista: `list_smart_documents` med `kind: "board_minutes"`.
  Styret på avtaleparten: `get_board` og `update_board`. Signeringen: `get_agreement` med `view: "signing"`.
- **CLI:** `dealbook styreprotokoll <kommando>` (eller `npx -y @companybook/dealbook styreprotokoll`).
  `dealbook styreprotokoll --help` viser alt. `--json` gir maskinlesbar utdata. Alt som endrer noe er en
  tørrkjøring uten `--yes`, og `send` sender ekte e-poster bare med `--yes`.
- **REST** (`api.dealbook.no/v1/board-minutes`): samme operasjoner (`POST /:id/apply`, `POST /:id/preview`,
  `GET /:id/guidance`, `GET /:id/documents/:format` …).
- **Datalaget:** `board_minutes_get` med `view: "schema"` eller `dealbook styreprotokoll schema` (JSON Schema for møtet,
  deltakerne, sakene og kommandoene, med regeltabellen). Les det før du bygger en kommando du ikke har brukt før.

Oppsett og nøkkel som i `/dealbook`: `dealbook whoami`; be aldri om nøkkelen i chatten.

## Harde regler

1. **Start med selskapet og styret.** Kall `get_board` for avtaleparten. Mangler styret eller e-postene, rett
   det med brukeren (`update_board`) før du skriver protokollen; e-postene brukes til signeringslenkene.
2. **Aldri finn på** hvem som var til stede, vedtak, stemmer, dissens, tid eller sted. Alt skal komme fra
   brukeren (eller fra et referat brukeren gir deg). Det som mangler, spør du om.
3. **Vurderingen regnes av Dealbook.** Beslutningsdyktighet og flertall sendes aldri inn; send oppmøte, stemmer og
   inhabile, og les vurderingen (`items`, `guidance`, `validation`) i svaret. Signererne er som standard alle med
   stemmerett som deltok. Vil brukeren at færre eller andre signerer (for eksempel møteleder og ett valgt medlem),
   send `update_protocol` med `signerKeys` (nøklene til deltakere som er til stede; `null` går tilbake til
   standarden). Si da fra om merknaden `bm.6-29.signers_chosen`: loven sier alle som deltok. Den stopper ikke.
4. **Alltid forhåndsvisning før innføring.** MCP: `board_minutes_apply` med `dry_run: true`. CLI: kjør uten `--yes` først.
   Vis funnene og før inn først etter et eksplisitt ja.
5. **Veiledningen varsler, den stopper ikke.** Alle funn er merknader («Bør sjekkes»). Gå gjennom dem med brukeren
   før sending; brukeren kan sende likevel. `override: { reason }` er valgfritt og bare brukerens egen begrunnelse
   (uten den fører Dealbook «Sendt med N åpne merknader: …» i loggen).
6. **Utsending krever eget ja.** `board_minutes_send_for_signing` sender ekte e-poster til styremedlemmene.
   Vis hvem som får lenken (`signers` fra `board_minutes_get`) og merknadene, og kall verktøyet først etter at
   brukeren eksplisitt har sagt ja. `board_minutes_apply` kan ikke sende. Sendingen feiler hvis ingen signerer,
   noen mangler e-post, samme e-post står to ganger eller det er flere enn 10 signerere.
7. **Konflikt (409)** betyr at noen andre har endret protokollen. Hent den på nytt og spør igjen.
8. Dette er ikke juridisk rådgivning. Veiledningen er et hjelpemiddel; ved tvil, anbefal advokat.

## To innganger

- **Skriv protokollen i Dealbook (`write_protocol`).** Det vanlige. Uten `participants` hentes styret fra
  avtaleparten (alle til stede unntatt vara; rett oppmøtet med brukeren); uten `items` brukes standardsakene (godkjenning av
  innkalling og dagsorden, forrige protokoll, eventuelt). Sakene nummereres per møte (1, 2, 3). Vil selskapet
  nummerere løpende for året («N/ÅÅ», etter forrige protokoll), se `caseNumbers` i `board_minutes_get` og send
  `update_protocol` med `caseNumbers.renumbered.year` på sakene.
- **Last opp en ferdig protokoll (`import_protocol`).** For en protokoll som allerede er skrevet (PDF). Filen må
  lastes opp i Dealbook av brukeren (appen); verktøyet tar `uploadId` og `fileId` fra den opplastingen, ikke
  filen selv. I tillegg deltakerne (hvem som signerer) og hvilke minstekrav brukeren bekrefter at protokollen har
  (`checklist`: time_and_place, participants, procedure, decisions, quorum). Er klar til sending med en gang.

## Minstekravene (asl. § 6-29 og §§ 6-24 til 6-27)

- Tid og sted for møtet, hvem som deltok, behandlingsmåten (møte, elektronisk, hybrid eller skriftlig) og
  styrets beslutninger (§ 6-29 (1)). For fysisk eller hybrid møte trengs sted.
- Er en beslutning ikke enstemmig, skal det fremgå hvem som stemte for og imot (§ 6-29 (2)). Et styremedlem
  eller daglig leder som er uenig, kan kreve sin oppfatning ført inn (dissens og protokolltilførsel).
- Styret er beslutningsdyktig når mer enn halvparten av alle styremedlemmene er til stede eller deltar
  (§ 6-24); varamedlem som trer inn, teller for den som har forfall.
- Vedtak krever flertall av de avgitte stemmene, og de som stemmer for, må utgjøre mer enn en tredel av alle
  styremedlemmene (§ 6-25). Står stemmene likt, gjelder møteleders stemme; ved valg av styreleder avgjøres det ved
  loddtrekning (§ 6-26).
- Et inhabilt styremedlem (§ 6-27) deltar ikke i behandlingen og teller ikke for beslutningsdyktigheten i saken.
- Protokollen signeres av alle styremedlemmene som deltok. Brukeren kan velge noe annet (`signerKeys`); da varsler
  veiledningen, men stopper ikke.

## Innkalling, notater og materiale

**Innkallingen i Dealbook (smart dokument, `/styreinnkalling`).** Er møtet kalt inn med Dealbook, skriv protokollen
fra innkallingen: `board_minutes_create` med `write_protocol` og `meetingRef: { kind: "board_meeting", id:
<innkallingens id> }` (finn den med `list_smart_documents` og `kind: "board_meeting_notice"`). Møtet, de innkalte, sakene (samme id og
saksnummer) og vedleggene fylles ut der kommandoen mangler dem. Protokollen starter blank: sakene har verken referat
(`body`) eller vedtak (`decision`). Det innkallingen sa om saken (saksframstilling og forslag til vedtak) står som
referanse i `item.notice` (`body`, `proposal`), bare til lesing; `update_protocol` beholder den. Et forslag er ikke et
vedtak før brukeren (eller notatene) sier at det ble vedtatt (regel 2).
Neste steg er det som skjedde i møtet: `draft_from_notes` med `text` (notatene, referatet eller transkripsjonen
brukeren gir deg, tekst eller Markdown), eller skriv sakene direkte med `update_protocol` (referat i `body`, vedtak
i `decision`, stemmer i `vote`) fra det brukeren forteller. Høyst én protokoll per innkalling (feilkode
`conflict`). For en protokoll som alt finnes (bare i utkast): `board_minutes_apply` med `set_meeting_ref` (`noticeId`; `prefill: true`
henter møtet, de innkalte, sakene og vedleggene på nytt og erstatter dem; `noticeId: null` kobler fra og beholder
innholdet). Protokollen følger ikke innkallingen av seg selv: endres innkallingen senere, sier veiledningen fra
(`bm.notice.changed`, også når saksframstillingen eller forslaget er endret: `notice.changed.changedText`), og «Hent
endringene» er `set_meeting_ref` med `prefill: true`. Den henter sakene med ny tekst i `item.notice` og beholder
referatet, vedtakene og stemmene som er skrevet.

**Innkallingen som fil i arkivet.** Er innkallingen sendt utenfor Dealbook, kobles den som dokument (`role: notice`,
under). Enten `meetingRef` eller en `notice`-lenke oppfyller `bm.notice.missing`.

Dokumentene bak møtet ligger i arkivet i Dealbook og kobles til protokollen med `link_document`
(`agreementId`, `role`, og `itemId` for materiale som gjelder en sak). Filene lastes opp av brukeren i appen
(på protokollsiden, eller i arkivet); verktøyene tar ikke imot filer. Finn dokumentet med `list_agreements`.

- `notice`: innkallingen. Høyst én; en ny erstatter den forrige. Nevnes i protokollen. Mangler den, sier
  veiledningen fra (`bm.notice.missing`).
- `notes`: notater eller transkripsjon fra møtet. Arbeidsmateriale: aldri med i protokollen, aldri sendt ut.
- `material`: presentasjoner og rapporter som ble gjennomgått, for møtet eller en sak. Nevnes i protokollen.
- `unlink_document` fjerner koblingen (dokumentet blir liggende i arkivet). Innkalling og materiale kan bare kobles
  før protokollen sendes; notater i alle statuser unntatt annullert.

**Utkast fra notatene (`draft_from_notes`).** Med `text` (notater, referat eller transkripsjon limt inn, høyst
200 000 tegn), et notat koblet eller en innkalling lager Claude møtet, oppmøtet og sakene, og *erstatter* det som
står. `text` lagres ikke (bare utkastet føres i loggen); vil brukeren ta vare på notatene, laster hun dem opp i
møtemappen. Skrevet fra en innkalling i Dealbook får Claude sakslisten med saksframstilling og forslag, men skriver
vedtak bare der notatene viser at de ble fattet. CLI: `dealbook styreprotokoll draft <protokoll> --notes notater.md`
(uten `--yes` en tørrkjøring). Spør brukeren først, og si at det kan angres i loggen (`revert`). Kallet kan ta
et par minutter. Les `warnings` i svaret høyt for brukeren: det er det Claude var usikker på. Kontroller så
oppmøtet, stemmene og vedtakene med brukeren før sending; regel 2 gjelder også et utkast.

## Arbeidsflyt

1. **Styret.** `get_board`. Bekreft med brukeren hvem som er styreleder, medlemmer og vara, og at e-postene er
   riktige.
2. **Opprett.** `board_minutes_create` med `write_protocol`: `company` (orgNr og navn), `meeting` (dato, tid,
   behandlingsmåte, sted, møteleder og protokollfører) og gjerne `participants` og `items` hvis brukeren alt har
   dem. Opprett etter brukerens ja. Planens grense for smarte dokumenter gir feilkode `limit`.
3. **Koble innkallingen**: `meetingRef` i trinn 2 for en innkalling fra Dealbook, ellers `link_document` med
   `role: notice` (og notatene med `role: notes`). Har brukeren notater eller en transkripsjon, kan
   `draft_from_notes` med `text` lage utkastet (se over).
4. **Fyll inn.** `board_minutes_apply` med `update_protocol`. Listene erstattes som helhet: send hele
   `participants` (med `attendance`) og hele `items`. En sak har `kind` (orientation, decision, election,
   approval), `title`, `body`, `decision` og `vote` (`unanimous`, eller `recorded` med `for`, `against` og
   `abstain`), pluss `disqualified`, `dissents` og `addenda`. Bruk `expectedVersion` fra forrige svar.
5. **Kontroller.** `board_minutes_get` med `view: "guidance"` (eller `board_minutes_apply` med `dry_run: true` og
   `send_for_signing`): gå gjennom merknadene med brukeren og rett med `update_protocol`. Vis gjerne utkastet
   (`view: "document"` med `format: "protocol_pdf"`).
6. **Spør om eksplisitt ja.** Vis signererne fra `board_minutes_get` (`signers`), merknadene som står åpne, og at
   signererne får en e-post med signeringslenke.
7. **Send.** `board_minutes_send_for_signing` med `expectedVersion` (og eventuelt `signingDays`). Et utkast lukkes
   i samme kall.
8. **Følg med.** Svaret har `state.signingRounds` med `agreementId`; `get_agreement` med `view: "signing"` viser hvem
   som har signert. Når alle har signert, blir protokollen signert, og `view: "document"` med `protocol_pdf` gir
   den forseglede PDF-en.

Må protokollen rettes etter utsending: `withdraw_signing` (via `board_minutes_apply`, etter brukerens ja), rett med
`update_protocol` (protokollen åpnes av seg selv), og send på nytt etter nytt ja.

## Dokumenter, historikk og retting

- `board_minutes_get` med `view: "document"`: `protocol_pdf` (generert, merket «Utkast» før sending; den opplastede; eller den
  signerte), `json` og `markdown`. Tidsreise med `version` eller `date`.
- `view: "history"` og `view: "verify"` (regner hash-kjeden på nytt).
- Feilføringer rettes med `void` (bestemte hendelser, `seqs`) eller `revert` via `board_minutes_apply`
  (tilbake til versjon N), begge med begrunnelse og bare etter brukerens eksplisitte ja.
