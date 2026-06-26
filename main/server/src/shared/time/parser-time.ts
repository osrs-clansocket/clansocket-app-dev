import { isNonBlank } from "../validators/type-guards.js";

export function toMs(iso: string): number {
    return new Date(iso).getTime();
}

export function tryParseIso(iso: string | null | undefined): number | null {
    if (!isNonBlank(iso)) return null;
    const ms = new Date(iso).getTime();
    return Number.isNaN(ms) ? null : ms;
}

export const parseIsoMs = (iso: string | null | undefined): number => tryParseIso(iso) ?? 0;
