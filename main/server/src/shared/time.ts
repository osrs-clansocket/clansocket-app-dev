import { isNonBlank } from "./validators/type-guards.js";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const FIVE_MINUTES_MS = 5 * MS_PER_MINUTE;
const TEN_MINUTES_MS = 10 * MS_PER_MINUTE;

function asIso(date: Date): string {
    return date.toISOString();
}

function nowIso(): string {
    return asIso(new Date());
}

function toMs(iso: string): number {
    return new Date(iso).getTime();
}

function floorTo(iso: string, unit: number): string {
    const ms = toMs(iso);
    return new Date(Math.floor(ms / unit) * unit).toISOString();
}

const hourFloor = (iso: string): string => floorTo(iso, MS_PER_HOUR);
const dayFloor = (iso: string): string => floorTo(iso, MS_PER_DAY);

function weekFloor(iso: string): string {
    const d = new Date(iso);
    const day = d.getUTCDay();
    const diff = (day + 6) % 7;
    d.setUTCDate(d.getUTCDate() - diff);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
}

function monthFloor(iso: string): string {
    const d = new Date(iso);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

function hoursBetween(aIso: string, bIso: string): number {
    return Math.abs(toMs(bIso) - toMs(aIso)) / MS_PER_HOUR;
}

function msBetween(aIso: string, bIso: string): number {
    return Math.abs(toMs(bIso) - toMs(aIso));
}

function cutoffFromNow(msAgo: number): string {
    return asIso(new Date(Date.now() - msAgo));
}

function tryParseIso(iso: string | null | undefined): number | null {
    if (!isNonBlank(iso)) return null;
    const ms = new Date(iso).getTime();
    return Number.isNaN(ms) ? null : ms;
}

const parseIsoMs = (iso: string | null | undefined): number => tryParseIso(iso) ?? 0;

function hasElapsed(lastMs: number | null, intervalMs: number, nowMs: number = Date.now()): boolean {
    if (lastMs === null) return true;
    return nowMs - lastMs >= intervalMs;
}

function msUntilNext(lastMs: number | null, intervalMs: number, nowMs: number = Date.now()): number {
    if (lastMs === null) return 0;
    const elapsed = nowMs - lastMs;
    if (elapsed >= intervalMs) return 0;
    return intervalMs - elapsed;
}

export {
    nowIso,
    toMs,
    hourFloor,
    dayFloor,
    weekFloor,
    monthFloor,
    hoursBetween,
    msBetween,
    cutoffFromNow,
    hasElapsed,
    msUntilNext,
    parseIsoMs,
    tryParseIso,
};
export { MS_PER_SECOND, MS_PER_MINUTE, MS_PER_HOUR, MS_PER_DAY, FIVE_MINUTES_MS, TEN_MINUTES_MS };
