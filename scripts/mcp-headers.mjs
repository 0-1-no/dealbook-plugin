#!/usr/bin/env node
// headersHelper for Dealbook-MCP-en i .mcp.json. Claude Code tømmer variabler med KEY i navnet,
// både i `headers` og i miljøet til denne kommandoen, så nøkkelen leses fra fila som
// `dealbook login` skriver (~/.config/dealbook/config.json). Samme sti som CLI-en.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const configFile = (env) => join(env.XDG_CONFIG_HOME || join(env.HOME || homedir(), ".config"), "dealbook", "config.json");

/** Headerne til MCP-serveren, eller null når ingen nøkkel finnes. */
export function mcpHeaders(env, read = (path) => readFileSync(path, "utf8")) {
  let file = {};
  try {
    file = JSON.parse(read(configFile(env)));
  } catch {
    file = {};
  }
  const key = env.DEALBOOK_API_KEY?.trim() || file.apiKey?.trim();
  if (!key) return null;
  // Valgt avtalepart for en nøkkel for Alle avtaleparter («dealbook use»). Agenten kan også sende workspace per kall.
  const workspace = env.DEALBOOK_WORKSPACE?.trim() || file.workspace?.trim();
  return { Authorization: `Bearer ${key}`, ...(workspace ? { "Dealbook-Workspace": workspace } : {}) };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const headers = mcpHeaders(process.env);
  if (!headers) {
    console.error("Fant ingen Dealbook-nøkkel. Lag en på https://dealbook.no/konto/nokler og kjør «npx -y @companybook/dealbook login».");
    process.exit(1);
  }
  process.stdout.write(JSON.stringify(headers));
}
