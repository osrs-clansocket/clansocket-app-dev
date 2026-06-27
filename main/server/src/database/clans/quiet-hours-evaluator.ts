import type { MemberPreferences } from "./member-preferences-store.js";

function currentLocalHour(now: number, timezone: string | null): number {
    if (!timezone) return new Date(now).getUTCHours();
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", hourCycle: "h23" });
    const parts = fmt.formatToParts(new Date(now));
    const hourPart = parts.find((p) => p.type === "hour");
    return hourPart ? Number(hourPart.value) : new Date(now).getUTCHours();
}

export function isInQuietHours(prefs: MemberPreferences, now: number): boolean {
    if (prefs.quietHoursStart === null || prefs.quietHoursEnd === null) return false;
    const tz = prefs.timezone && prefs.timezone.length > 0 ? prefs.timezone : null;
    const hour = currentLocalHour(now, tz);
    const start = prefs.quietHoursStart;
    const end = prefs.quietHoursEnd;
    if (start === end) return false;
    if (start < end) return hour >= start && hour < end;
    return hour >= start || hour < end;
}
