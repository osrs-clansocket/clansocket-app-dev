import { appEmoji } from "../../../database/discord/emojis/lookup-by-name.js";
import { isAsciiAlphanumeric, lowercaseAsciiString } from "../../../shared/parsers/ascii-bounds.js";

const COLON = ":";
const SPACE = " ";
const LT = "<";
const GT = ">";
const MAX_NAME_LENGTH = 32;
const MIN_NAME_LENGTH = 2;
const MAX_DISCORD_NATIVE_LENGTH = 128;

const ALLOWED_PUNCTUATION: ReadonlySet<string> = new Set(["_", "-", " ", "'", "."]);
const SKIP_SHORTCODE_VALUES: ReadonlySet<string> = new Set(["normal"]);

function charAt(src: string, i: number, c: string): boolean {
    return src[i] === c;
}

function isNativeStart(src: string, i: number): boolean {
    if (!charAt(src, i, LT)) return false;
    if (i + 1 >= src.length) return false;
    const next = src[i + 1];
    if (next === COLON || next === "@" || next === "#") return true;
    return (next === "t" || next === "a") && charAt(src, i + 2, COLON);
}

const ACCEPT = 1;
const REJECT = -1;
const CONTINUE = 0;
type ScanVerdict = 1 | -1 | 0;

function scanUntil(src: string, start: number, limit: number, classify: (c: string) => ScanVerdict): number {
    for (let j = start; j < limit; j++) {
        const v = classify(src[j]);
        if (v === ACCEPT) return j;
        if (v === REJECT) return -1;
    }
    return -1;
}

function classifyNative(c: string): ScanVerdict {
    if (c === GT) return ACCEPT;
    if (c === LT) return REJECT;
    return CONTINUE;
}

function discordNativeEnd(src: string, start: number): number {
    return scanUntil(src, start + 1, Math.min(src.length, start + MAX_DISCORD_NATIVE_LENGTH), classifyNative);
}

function isSkippableShortcode(name: string): boolean {
    return SKIP_SHORTCODE_VALUES.has(lowercaseAsciiString(name));
}

function isNameChar(ch: string): boolean {
    return isAsciiAlphanumeric(ch.charCodeAt(0)) || ALLOWED_PUNCTUATION.has(ch);
}

function classifyShortcode(c: string): ScanVerdict {
    if (c === COLON) return ACCEPT;
    if (!isNameChar(c)) return REJECT;
    return CONTINUE;
}

function findShortcodeEnd(src: string, start: number): number {
    return scanUntil(src, start, Math.min(src.length, start + MAX_NAME_LENGTH + 1), classifyShortcode);
}

function buildEmojiSyntax(name: string, emojiId: string, animated: number): string {
    const prefix = animated === 1 ? "a" : "";
    return `<${prefix}:${name}:${emojiId}>`;
}

interface ParseStep {
    advance: number;
    out: string;
}

function consumeDiscordNative(text: string, i: number): ParseStep | null {
    if (!isNativeStart(text, i)) return null;
    const closeIdx = discordNativeEnd(text, i);
    if (closeIdx === -1) return null;
    return { out: text.slice(i, closeIdx + 1), advance: closeIdx + 1 - i };
}

function consumeShortcode(text: string, i: number, botId: string): ParseStep | null {
    if (text[i] !== COLON || i + 1 >= text.length) return null;
    const nameStart = i + 1;
    const nameEnd = findShortcodeEnd(text, nameStart);
    if (nameEnd === -1 || nameEnd - nameStart < MIN_NAME_LENGTH) return null;
    const name = text.slice(nameStart, nameEnd);
    if (isSkippableShortcode(name)) {
        const trailingSpace = text[nameEnd + 1] === SPACE ? 1 : 0;
        return { out: "", advance: nameEnd + 1 + trailingSpace - i };
    }
    const hit = appEmoji(botId, name);
    const renderedOut = hit !== null ? buildEmojiSyntax(hit.name, hit.emoji_id, hit.animated) : `:${name}:`;
    return { out: renderedOut, advance: nameEnd + 1 - i };
}

function consumeOne(text: string, i: number, botId: string): ParseStep {
    return consumeDiscordNative(text, i) ?? consumeShortcode(text, i, botId) ?? { out: text[i], advance: 1 };
}

export function expandEmojiShortcodes(text: string, botId: string): string {
    const parts: string[] = [];
    let i = 0;
    while (i < text.length) {
        const step = consumeOne(text, i, botId);
        parts.push(step.out);
        i += step.advance;
    }
    return parts.join("");
}
