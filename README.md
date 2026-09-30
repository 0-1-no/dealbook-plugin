# Dealbook for Claude Code

Lag avtaler sammen med agenten din og send dem til signering med [Dealbook](https://dealbook.no).
Motparten signerer på sign.dealbook.no. Du følger status fra terminalen eller på dealbook.no.

## Installer

```
/plugin marketplace add 0-1-no/dealbook-plugin
/plugin install dealbook@dealbook
```

Lag en API-nøkkel på https://dealbook.no/innstillinger/nokler og logg inn med CLI-en:

```
npx -y @companybook/dealbook login
```

MCP-serveren (`mcp.dealbook.no`) bruker den samme nøkkelen. Pluginen leser den fra
`~/.config/dealbook/config.json`, som `login` skriver. Start Claude Code på nytt etter innlogging.

## Bruk

Si `/dealbook` eller «lag en konsulentavtale med …». Agenten intervjuer deg, skriver utkast,
lager PDF-en lokalt og sender den først når du har sagt ja.

Kilden ligger i Dealbook-monorepoet (`plugins/dealbook`) og speiles hit.
