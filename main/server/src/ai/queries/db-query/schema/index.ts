import { DB_NAMES, STATIC_DB_NAMES } from "../../../../database/index.js";
import { CHAIN_DB } from "../types.js";
import { tryAppendClan, tryAppendPlugin, tryAppendStatic } from "./builders.js";
import { listAccessibleClans } from "./purpose.js";

export function getSchema(siteAccountId: string): string {
    const lines: string[] = [
        "Available databases. Wrong db = wasted turn. Plugin dbs require a 'clan' field on the query naming which clan to read from.\n",
    ];
    const clans = listAccessibleClans(siteAccountId);
    if (clans.length === 0) {
        lines.push("[no accessible clans — plugin telemetry not available for this user]");
        lines.push("");
    }
    for (const clan of clans) {
        tryAppendClan(lines, clan.id, clan.slug);
        tryAppendPlugin(lines, clan.id, clan.slug);
    }
    tryAppendStatic(lines, CHAIN_DB);
    tryAppendStatic(lines, DB_NAMES.AI);
    tryAppendStatic(lines, STATIC_DB_NAMES.GAME_IDS);
    return lines.join("\n");
}
