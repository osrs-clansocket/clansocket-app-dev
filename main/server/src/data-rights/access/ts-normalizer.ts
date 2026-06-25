const MS_THRESHOLD = 1e12;
const SECONDS_TO_MS = 1000;

export function normalizeTs(ts: number | null | undefined): number | null {
    if (ts === null || ts === undefined) return null;
    if (!Number.isFinite(ts) || ts <= 0) return null;
    if (ts < MS_THRESHOLD) return Math.round(ts * SECONDS_TO_MS);
    return Math.round(ts);
}
