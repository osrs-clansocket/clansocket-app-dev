export const DOW_LABELS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export const DAYS_PER_WEEK = 7;
export const WEEKS_SHOWN = 6;

export function monthFirstUTC(year: number, month: number): Date {
    return new Date(Date.UTC(year, month, 1));
}

export function monthTitle(d: Date): string {
    return d.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
