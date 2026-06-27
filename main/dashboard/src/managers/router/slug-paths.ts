import {
    CHARCODE_DASH,
    CHARCODE_DIGIT_0,
    CHARCODE_DIGIT_9,
    CHARCODE_LOWER_A,
    CHARCODE_LOWER_Z,
    CHARCODE_UPPER_A,
    CHARCODE_UPPER_Z,
} from "../../shared/constants/ascii-constants.js";

const CLAN_PREFIX = "/clans/";
const SINGULAR_CLAN_PREFIX = "/clan/";
const MANAGE_SEGMENT = "/manage";
const LIVE_SEGMENT = "/live";
const ROSTER_SEGMENT = "/roster";

function inRange(c: number, lo: number, hi: number): boolean {
    return c >= lo && c <= hi;
}

function isSlugChar(c: number): boolean {
    return (
        inRange(c, CHARCODE_LOWER_A, CHARCODE_LOWER_Z) ||
        inRange(c, CHARCODE_UPPER_A, CHARCODE_UPPER_Z) ||
        inRange(c, CHARCODE_DIGIT_0, CHARCODE_DIGIT_9) ||
        c === CHARCODE_DASH
    );
}

function trimSlugSlash(s: string): string {
    return s.endsWith("/") ? s.slice(0, -1) : s;
}

function allSlugChars(s: string): boolean {
    for (let i = 0; i < s.length; i++) {
        if (!isSlugChar(s.charCodeAt(i))) return false;
    }
    return true;
}

function stripQuery(path: string): string {
    const qAt = path.indexOf("?");
    return qAt === -1 ? path : path.slice(0, qAt);
}

function slugBody(path: string): string {
    const stripped = stripQuery(path);
    if (!stripped.startsWith(CLAN_PREFIX)) return "";
    const body = trimSlugSlash(stripped.slice(CLAN_PREFIX.length));
    if (body.length === 0) return "";
    return allSlugChars(body) ? body : "";
}

export function matchClanPath(path: string): boolean {
    return slugBody(path).length > 0;
}

export function clanSlug(path: string): string {
    return slugBody(path).toLowerCase();
}

function slugBodyOf(path: string, segment: string): string {
    const stripped = stripQuery(path);
    if (!stripped.startsWith(CLAN_PREFIX)) return "";
    const afterPrefix = stripped.slice(CLAN_PREFIX.length);
    const segAt = afterPrefix.indexOf(segment);
    if (segAt <= 0) return "";
    const slug = afterPrefix.slice(0, segAt);
    if (!allSlugChars(slug)) return "";
    const tail = afterPrefix.slice(segAt + segment.length);
    if (tail.length > 0 && !tail.startsWith("/")) return "";
    return slug;
}

function manageSlugBody(path: string): string {
    return slugBodyOf(path, MANAGE_SEGMENT);
}

function liveSlugBody(path: string): string {
    return slugBodyOf(path, LIVE_SEGMENT);
}

function rosterSlugBody(path: string): string {
    return slugBodyOf(path, ROSTER_SEGMENT);
}

export function matchManage(path: string): boolean {
    return manageSlugBody(path).length > 0;
}

export function matchRoster(path: string): boolean {
    return rosterSlugBody(path).length > 0;
}

export function rosterSlug(path: string): string {
    return rosterSlugBody(path).toLowerCase();
}

export function manageSlug(path: string): string {
    return manageSlugBody(path).toLowerCase();
}

export function matchLive(path: string): boolean {
    return liveSlugBody(path).length > 0;
}

export function liveSlug(path: string): string {
    return liveSlugBody(path).toLowerCase();
}

function manageSlugSegments(path: string): readonly string[] {
    const slug = manageSlugBody(path);
    if (slug.length === 0) return [];
    const afterSlug = path.slice(CLAN_PREFIX.length + slug.length + MANAGE_SEGMENT.length);
    const tail = trimSlugSlash(afterSlug);
    if (tail.length === 0) return [];
    if (!tail.startsWith("/")) return [];
    return tail.slice(1).split("/");
}

export function manageTab(path: string): string | null {
    const segs = manageSlugSegments(path);
    if (segs.length === 0) return null;
    const tab = segs[0]!;
    return allSlugChars(tab) ? tab : null;
}

export function manageSubTab(path: string): string | null {
    const segs = manageSlugSegments(path);
    if (segs.length < 2) return null;
    const subTab = segs[1]!;
    if (subTab.length === 0) return null;
    return allSlugChars(subTab) ? subTab : null;
}

export function normalizeClanPath(path: string): string {
    return path.startsWith(SINGULAR_CLAN_PREFIX) ? CLAN_PREFIX + path.slice(SINGULAR_CLAN_PREFIX.length) : path;
}

const AI_SETTINGS_PREFIX = "/ai-settings";

export function matchAiSettings(path: string): boolean {
    const stripped = stripQuery(path);
    return stripped === AI_SETTINGS_PREFIX || stripped.startsWith(`${AI_SETTINGS_PREFIX}/`);
}

export function aiSettingsTab(path: string): string | null {
    const stripped = stripQuery(path);
    if (!stripped.startsWith(AI_SETTINGS_PREFIX)) return null;
    const tail = trimSlugSlash(stripped.slice(AI_SETTINGS_PREFIX.length));
    if (tail.length === 0 || !tail.startsWith("/")) return null;
    const seg = tail.slice(1).split("/")[0]!;
    if (seg.length === 0 || !allSlugChars(seg)) return null;
    return seg;
}
