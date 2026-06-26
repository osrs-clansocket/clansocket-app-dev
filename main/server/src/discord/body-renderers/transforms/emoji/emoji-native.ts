import { SCAN, scanUntil, type ScanVerdict } from "./emoji-scanner.js";

const COLON = ":";
const LT = "<";
const GT = ">";
const MAX_DISCORD_NATIVE_LENGTH = 128;

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

const NATIVE_VERDICT_BY_CHAR: Record<string, ScanVerdict> = {
    [GT]: SCAN.ACCEPT,
    [LT]: SCAN.REJECT,
};

function classifyNative(c: string): ScanVerdict {
    return NATIVE_VERDICT_BY_CHAR[c] ?? SCAN.CONTINUE;
}

function discordNativeEnd(src: string, start: number): number {
    return scanUntil(src, start + 1, Math.min(src.length, start + MAX_DISCORD_NATIVE_LENGTH), classifyNative);
}

export interface ParseStep {
    advance: number;
    out: string;
}

export function consumeDiscordNative(text: string, i: number): ParseStep | null {
    if (!isNativeStart(text, i)) return null;
    const closeIdx = discordNativeEnd(text, i);
    if (closeIdx === -1) return null;
    return { out: text.slice(i, closeIdx + 1), advance: closeIdx + 1 - i };
}
