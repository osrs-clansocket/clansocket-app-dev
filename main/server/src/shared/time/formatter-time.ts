import { MS_PER_DAY, MS_PER_HOUR } from "./time-constants.js";
import { toMs } from "./parser-time.js";

export function nowIso(): string {
    return new Date().toISOString();
}

function floorTo(iso: string, unit: number): string {
    const ms = toMs(iso);
    return new Date(Math.floor(ms / unit) * unit).toISOString();
}

export const hourFloor = (iso: string): string => floorTo(iso, MS_PER_HOUR);
export const dayFloor = (iso: string): string => floorTo(iso, MS_PER_DAY);

export function weekFloor(iso: string): string {
    const d = new Date(iso);
    const day = d.getUTCDay();
    const diff = (day + 6) % 7;
    d.setUTCDate(d.getUTCDate() - diff);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
}

export function monthFloor(iso: string): string {
    const d = new Date(iso);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}
