const ISO_DATE_LEN = 10;

export function dateInputValue(ms: number | null): string {
    return ms === null ? "" : new Date(ms).toISOString().slice(0, ISO_DATE_LEN);
}
