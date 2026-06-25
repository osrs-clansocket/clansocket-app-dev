export function parseDate(s: string, endOfDay: boolean): number | null {
    if (!s) return null;
    const ms = Date.parse(endOfDay ? `${s}T23:59:59Z` : `${s}T00:00:00Z`);
    return Number.isFinite(ms) ? ms : null;
}
