import { DB_NAMES } from "../../core/db-constants.js";
import { getDb } from "../../core/database.js";
import { isAsciiDigit, isAsciiLower, isAsciiUpper, lowercaseAsciiChar } from "../../../shared/parsers/ascii-bounds.js";

export interface AppEmojiHit {
    name: string;
    emoji_id: string;
    animated: number;
}

const SELECT_SQL = `SELECT name, emoji_id, animated
FROM discord_application_emojis
WHERE bot_id = ? AND name = ? COLLATE NOCASE
LIMIT 1`;

function normalizeChar(c: string): string {
    const code = c.charCodeAt(0);
    if (isAsciiDigit(code) || isAsciiLower(code)) return c;
    if (isAsciiUpper(code)) return lowercaseAsciiChar(c);
    if (c === " " || c === "-" || c === "_") return "_";
    return "";
}

function joinChars(input: string, map: (c: string) => string): string {
    const parts: string[] = [];
    for (const c of input) parts.push(map(c));
    return parts.join("");
}

const normalizeWithUnderscores = (input: string) => joinChars(input, normalizeChar);
const compactForm = (normalized: string) => joinChars(normalized, (c) => (c === "_" ? "" : c));

const NAME_ALIASES: Record<string, string> = {
    hardcore_ironman: "hardcore",
    hardcoreironman: "hardcore",
    ultimate_ironman: "ultimate",
    ultimateironman: "ultimate",
    group_ironman: "regular_group_ironman",
    groupironman: "regular_group_ironman",
};

function runLookup(botId: string, candidate: string): AppEmojiHit | null {
    if (candidate.length === 0) return null;
    const db = getDb(DB_NAMES.DISCORD_BOT);
    const row = db.prepare(SELECT_SQL).get(botId, candidate) as AppEmojiHit | undefined;
    return row ?? null;
}

function tryAlias(botId: string, key: string): AppEmojiHit | null {
    const alias = NAME_ALIASES[key];
    if (alias === undefined) return null;
    return runLookup(botId, alias);
}

function buildLookupCandidates(name: string): string[] {
    const out = [name];
    const normalized = normalizeWithUnderscores(name);
    if (normalized !== name) out.push(normalized);
    const compact = compactForm(normalized);
    if (compact.length > 0 && compact !== normalized) out.push(compact);
    return out;
}

export function appEmoji(botId: string, name: string): AppEmojiHit | null {
    const candidates = buildLookupCandidates(name);
    for (const c of candidates) {
        const hit = runLookup(botId, c);
        if (hit !== null) return hit;
    }
    for (const c of candidates.slice(1)) {
        const alias = tryAlias(botId, c);
        if (alias !== null) return alias;
    }
    return null;
}
