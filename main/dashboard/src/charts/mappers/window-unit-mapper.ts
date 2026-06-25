const WEEK_DAY_THRESHOLD = 14;

export function unitForWindow(window: string): "hour" | "day" | "week" {
    if (window.endsWith("h")) return "hour";
    if (window.endsWith("d") && parseInt(window) > WEEK_DAY_THRESHOLD) return "week";
    return "day";
}
