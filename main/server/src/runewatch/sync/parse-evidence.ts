const EMPTY = "";

export function parseEvidenceRating(raw: unknown): number {
    if (raw === EMPTY) return NaN;
    if (typeof raw === "number") return raw;
    return Number(raw);
}
