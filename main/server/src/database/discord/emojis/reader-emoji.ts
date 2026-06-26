import { DB_NAMES } from "../../core/db-constants.js";
import { getDb } from "../../core/database.js";
import type { AppEmojiHit } from "./emoji-types.js";

const SELECT_SQL = `SELECT name, emoji_id, animated
FROM discord_application_emojis
WHERE bot_id = ? AND name = ? COLLATE NOCASE
LIMIT 1`;

const NAME_ALIASES: Record<string, string> = {
    hardcore_ironman: "hardcore",
    hardcoreironman: "hardcore",
    ultimate_ironman: "ultimate",
    ultimateironman: "ultimate",
    group_ironman: "regular_group_ironman",
    groupironman: "regular_group_ironman",
};

export function runLookup(botId: string, candidate: string): AppEmojiHit | null {
    if (candidate.length === 0) return null;
    const db = getDb(DB_NAMES.DISCORD_BOT);
    const row = db.prepare(SELECT_SQL).get(botId, candidate) as AppEmojiHit | undefined;
    return row ?? null;
}

export function tryAlias(botId: string, key: string): AppEmojiHit | null {
    const alias = NAME_ALIASES[key];
    if (alias === undefined) return null;
    return runLookup(botId, alias);
}
