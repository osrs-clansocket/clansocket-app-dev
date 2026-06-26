import { appEmoji } from "../../../../database/discord/emojis/resolver-emoji.js";
import { isAsciiAlphanumeric } from "../../../../shared/parsers/predicate-ascii.js";
import { lowercaseAsciiString } from "../../../../shared/parsers/lowercase-ascii.js";
import { SCAN, scanUntil, type ScanVerdict } from "./emoji-scanner.js";
import { buildEmojiSyntax } from "./emoji-syntax.js";
import type { ParseStep } from "./emoji-native.js";

const COLON = ":";
const SPACE = " ";
const MAX_NAME_LENGTH = 32;
const MIN_NAME_LENGTH = 2;

const ALLOWED_PUNCTUATION: ReadonlySet<string> = new Set(["_", "-", " ", "'", "."]);
const SKIP_SHORTCODE_VALUES: ReadonlySet<string> = new Set(["normal"]);

function isSkippableShortcode(name: string): boolean {
    return SKIP_SHORTCODE_VALUES.has(lowercaseAsciiString(name));
}

function isNameChar(ch: string): boolean {
    return isAsciiAlphanumeric(ch.charCodeAt(0)) || ALLOWED_PUNCTUATION.has(ch);
}

function classifyShortcode(c: string): ScanVerdict {
    if (c === COLON) return SCAN.ACCEPT;
    if (!isNameChar(c)) return SCAN.REJECT;
    return SCAN.CONTINUE;
}

function findShortcodeEnd(src: string, start: number): number {
    return scanUntil(src, start, Math.min(src.length, start + MAX_NAME_LENGTH + 1), classifyShortcode);
}

export function consumeShortcode(text: string, i: number, botId: string): ParseStep | null {
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
