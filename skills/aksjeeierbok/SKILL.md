---
name: aksjeeierbok
description: Bygg og vedlikehold selskapets aksjeeierbok i Dealbook (et smart dokument) sammen med brukeren: opprett fra Companybook, før inn salg, arv, gave, emisjon, splitt og pant, send melding etter § 4-10, del innsynslenke, og lag RF-1086, ren PDF eller kongelig PDF. Bruk ved /aksjeeierbok, «aksjeeierbok», «aksjonærregister», «aksjebok», «før inn et aksjesalg», «hvem eier selskapet», «RF-1086», «aksjonærregisteroppgaven» eller «pant i aksjer».
---

# /aksjeeierbok

Aksjeeierboken er selskapets viktigste dokument, og i Dealbook er den et smart dokument: hver endring
er en hendelse i en hash-kjedet logg (hvem, når, hvorfor, kanal). Boken du ser er en visning av loggen.
Ingenting slettes; feil rettes ved å ugyldiggjøre med begrunnelse (§ 4-7 krever historikk i minst 10 år).
Gjelder AS. ASA og AS i VPS føres i verdipapirregisteret, ikke her.

## Verktøy

- **CLI:** `dealbook aksjeeierbok <kommando>` (eller `npx -y @companybook/dealbook aksjeeierbok`).
  `dealbook aksjeeierbok --help` viser alt. `--json` gir maskinlesbar utdata. Boken kan angis med id,
  organisasjonsnummer eller starten av navnet (`fjordlys`); eiere med nøkkel eller navn.
- **MCP** (`mcp.dealbook.no`): `list_share_registers`, `create_share_register`, `get_share_register`,
  `record_share_event` (med `dry_run`), `upsert_shareholder`, `share_register_history`,
  `diff_share_register`, `void_share_register_event`, `revert_share_register`,
  `get_share_register_guidance`, `get_share_register_insights`, `export_share_register`, `get_rf1086`,
  `send_shareholder_notices`, `manage_share_register_links`, `get_share_register_schema`.
- **Datalaget:** `dealbook aksjeeierbok schema` eller `get_share_register_schema` (JSON Schema for alle
  kommandoer). Les det før du bygger en kommando du ikke har brukt før.

Oppsett og nøkkel som i `/dealbook`: `dealbook whoami`; be aldri om nøkkelen i chatten.

## Harde regler

1. **Aldri finn på** fødselsnummer, fødselsdato, organisasjonsnummer, aksjenumre, beløp eller datoer. Spør,
   eller hent fra Companybook. Mangler noe, la feltet stå tomt; veiledningen minner om det.
2. **Alltid forhåndsvisning før innføring.** CLI: kjør uten `--yes` først. MCP: `record_share_event` med
   `dry_run: true`. Vis brukeren aksjenumrene som flyttes, endringen per eier og veiledningen, og før inn
   først etter et eksplisitt ja.
3. **§ 4-15 ved overdragelse:** spør om styret har samtykket (eller at vedtektene ikke krever det) og om
   forkjøpsretten er frafalt eller ikke brukt. CLI: `--consent given|not_required` og
   `--preemption waived|not_exercised|not_applicable`. Uten svar føres ingenting inn.
4. **E-post krever eget ja:** `notices … --yes` / `send_shareholder_notices` sender ekte e-poster.
5. **Konflikt (409)** betyr at noen andre har endret boken. Hent den på nytt, vis endringen, og spør igjen.
6. Fødselsnummer brukes bare til RF-1086. Lagre det bare når brukeren oppgir det, og vis det bare når
   brukeren ber om det (hver visning logges). CLI: `--fnr` leser nummeret fra stdin eller et skjult
   spørsmål (`printf %s "$FNR" | dealbook aksjeeierbok shareholder <bok> <eier> --fnr`); skriv det aldri som
   argument på kommandolinjen, og ikke i chatten tilbake til brukeren.
7. **Blokkerende veiledning (✗)** stopper innføringen. Rett årsaken; bare hvis brukeren eksplisitt vil føre
   inn likevel, bruk `--override "<begrunnelse>"` (MCP: `override: { reason }`). Begrunnelsen logges.

## 1. Finn eller opprett boken

`dealbook aksjeeierbok list`. Finnes den ikke:

- **Fra Companybook:** `dealbook aksjeeierbok create <orgnr> [--nominal <kr>]`. Eierne hentes fra
  aksjonærregisteret per 31.12. Si tydelig fra om advarslene: aksjenumrene er tildelt fortløpende og må
  kontrolleres mot den gamle boken, og pålydende og aksjekapital må stemme. Spør om pålydende hvis
  brukeren vet det.
- **Nytt selskap (stiftelse):** bygg en `incorporate`-kommando (selskap, klasser, tegnere med antall og
  innbetalt beløp) og kjør `create --file stiftelse.json`.

Planen har en grense for antall smarte dokumenter (`list` viser «N av M brukt»); feilkode `limit` betyr at
den er nådd.

## 2. Gjør boken komplett (§ 4-5)

Kjør `dealbook aksjeeierbok guidance <bok>` og gå gjennom punktene med brukeren: fødselsdato og
bostedsadresse for personer, orgnr og forretningsadresse for foretak, digital adresse (e-post) for
meldinger. Før inn med `shareholder <bok> <eier> --birth … --address … --postal-code … --city … --email …`.
Kontaktpersoner, representanter og notater hører også hjemme her (grafen), men er ikke offentlige.

## 3. Før inn hendelser

Intervju kort: hva skjedde, når (dato og gjerne klokkeslett, RF-1086 krever tidspunkt), hvem, hvor mange
aksjer (eller hvilke numre), pris, og for overdragelser § 4-15.

```
dealbook aksjeeierbok record fjordlys transfer --from "Fjordlys Holding AS" --to "Havbris Kapital AS" \
  --shares 3000 --price 4500 --effective 2026-09-30T10:00:00+02:00 --consent given --preemption waived
```

Vis forhåndsvisningen. Etter ja: samme kommando med `--yes`. Andre hendelser: `issue` (emisjon),
`pledge`/`release-pledge` (pant, § 4-8), `split`/`reverse-split`, `dividend`, og alt annet via
`--file kommando.json` (fondsemisjon, sletting, endring av pålydende, klasser, relasjoner).
Arv og gave: `--kind inheritance|gift` uten pris; spør om skattemessig kontinuitet (`--tax-continuity`).

Etter innføring: tilby melding etter § 4-10 (`notices <bok> --seq <versjon>`, tørrkjøring først, så
`--yes`). Eiere uten e-post får PDF-en (`export <bok> --format notice --holder <eier> --seq <n>`).

## 4. Rett feil

Ingenting slettes. `void <bok> --seqs 7 --reason "…"` ugyldiggjør en hendelse (avvises hvis senere
hendelser bygger på den); `revert <bok> --to-version 5 --reason "…"` ugyldiggjør alt vesentlig etter
versjon 5. Begge er tørrkjøring uten `--yes`. Før deretter inn det riktige.

## 5. Dokumenter og RF-1086

- Ren PDF: `export <bok> --format minimal`. Kongelig PDF for utskrift, med segl og hash:
  `--format royal`. Tidsreise: `--version <n>` eller `--date <åååå-mm-dd>`.
- RF-1086 (frist 31. januar): `dealbook aksjeeierbok rf1086 <bok> --year <år>` viser om selskapstallene
  stemmer med summen hos aksjonærene per klasse, og hva som må rettes. `export --format rf1086` skriver
  JSON; `--format rf1086-worksheet` gir arbeidsarket som PDF. Innsending skjer fra et sluttbrukersystem
  med disse tallene; direkte innsending fra Dealbook kommer. Etter innsending: `rf1086 … --mark-filed`.

## 6. Innsyn og innsikt

- Aksjeeierboken er offentlig (§ 4-6), unntatt digital adresse. `links <bok> create --label Revisor`
  gir en innsynslenke uten e-post og fødselsnummer; `links <bok> revoke <id>` stopper den.
- `insights <bok>` tilpasser seg antall eiere: én eier gir eierkjeden oppover; flere gir fordeling,
  utvikling og reelle rettighetshavere (over 25 %, meldes innen 14 dager).
- `history <bok>` viser loggen; `diff <bok> --from 3 --to 7` hva som endret seg; `verify <bok>` regner
  hash-kjeden på nytt.
