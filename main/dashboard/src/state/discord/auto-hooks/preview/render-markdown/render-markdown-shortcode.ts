import { discordEmojiEntry, urlOf, type DiscordEmojiEntry } from "../../../../icons/discord-emojis-store.js";
import { compactForm, isCodeChar, lowercaseAscii, normalizeWithUnderscores } from "./render-markdown-charclass.js";
import { EMOJI_SEP, MAX_SHORTCODE_LENGTH, MIN_SHORTCODE_LENGTH, SPACE, type Node } from "./render-markdown-types.js";

const SKIP_SHORTCODE_VALUES: ReadonlySet<string> = new Set(["normal"]);

const SHORTCODE_NAME_ALIASES: Record<string, string> = {
    hardcore_ironman: "hardcore",
    hardcoreironman: "hardcore",
    ultimate_ironman: "ultimate",
    ultimateironman: "ultimate",
    group_ironman: "regular_group_ironman",
    groupironman: "regular_group_ironman",
};

function tryLookup(key: string | undefined): DiscordEmojiEntry | null {
    if (!key) return null;
    return discordEmojiEntry(key) ?? null;
}

function lookupShortcodeEmoji(name: string): DiscordEmojiEntry | null {
    const direct = tryLookup(name);
    if (direct !== null) return direct;
    const normalized = normalizeWithUnderscores(name);
    const norm = normalized !== name ? tryLookup(normalized) : null;
    if (norm !== null) return norm;
    const compact = compactForm(normalized);
    const comp = compact.length > 0 && compact !== normalized ? tryLookup(compact) : null;
    if (comp !== null) return comp;
    const aliasNorm = tryLookup(SHORTCODE_NAME_ALIASES[normalized]);
    if (aliasNorm !== null) return aliasNorm;
    return tryLookup(SHORTCODE_NAME_ALIASES[compact]);
}

function findShortcodeEnd(src: string, start: number): number {
    const limit = Math.min(src.length, start + MAX_SHORTCODE_LENGTH + 1);
    for (let j = start; j < limit; j++) {
        if (src[j] === EMOJI_SEP) return j;
        if (!isCodeChar(src[j])) return -1;
    }
    return -1;
}

export type ShortcodeResult = { kind: "node"; node: Node; nextIdx: number } | { kind: "skip"; nextIdx: number } | null;

export function tryParseShortcode(src: string, i: number): ShortcodeResult {
    if (src[i] !== EMOJI_SEP || i + 1 >= src.length) return null;
    const nameStart = i + 1;
    const nameEnd = findShortcodeEnd(src, nameStart);
    if (nameEnd === -1 || nameEnd - nameStart < MIN_SHORTCODE_LENGTH) return null;
    const name = src.slice(nameStart, nameEnd);
    if (SKIP_SHORTCODE_VALUES.has(lowercaseAscii(name))) {
        let next = nameEnd + 1;
        if (src[next] === SPACE) next++;
        return { kind: "skip", nextIdx: next };
    }
    const hit = lookupShortcodeEmoji(name);
    if (hit === null) return null;
    return {
        kind: "node",
        node: { kind: "emoji", id: hit.emoji_id, name: hit.name, animated: hit.animated === 1, url: urlOf(hit) },
        nextIdx: nameEnd + 1,
    };
}
