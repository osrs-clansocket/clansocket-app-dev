const MINUTE_MS = 60_000;
const MAX_FORWARD_YEARS = 4;
const MAX_FORWARD_MS = MAX_FORWARD_YEARS * 365 * 24 * 60 * MINUTE_MS;
const PARSE_CACHE_CAP = 256;

interface CronExpr {
    readonly minute: ReadonlySet<number>;
    readonly hour: ReadonlySet<number>;
    readonly dayOfMonth: ReadonlySet<number>;
    readonly month: ReadonlySet<number>;
    readonly dayOfWeek: ReadonlySet<number>;
}

const PARSE_CACHE = new Map<string, CronExpr>();

function parseField(field: string, min: number, max: number): Set<number> {
    const out = new Set<number>();
    for (const part of field.split(",")) {
        const slashIdx = part.indexOf("/");
        const stepRaw = slashIdx >= 0 ? part.slice(slashIdx + 1) : "1";
        const headRaw = slashIdx >= 0 ? part.slice(0, slashIdx) : part;
        const step = Number(stepRaw);
        if (!Number.isInteger(step) || step <= 0) throw new Error(`cron: invalid step "${stepRaw}"`);
        let rangeMin = min;
        let rangeMax = max;
        if (headRaw === "*") {
        } else {
            const dashIdx = headRaw.indexOf("-");
            if (dashIdx >= 0) {
                rangeMin = Number(headRaw.slice(0, dashIdx));
                rangeMax = Number(headRaw.slice(dashIdx + 1));
            } else {
                rangeMin = Number(headRaw);
                rangeMax = rangeMin;
            }
            if (!Number.isInteger(rangeMin) || !Number.isInteger(rangeMax)) {
                throw new Error(`cron: invalid range "${headRaw}"`);
            }
        }
        if (rangeMin < min || rangeMax > max || rangeMin > rangeMax) {
            throw new Error(`cron: out-of-bounds range "${headRaw}" for [${min},${max}]`);
        }
        for (let i = rangeMin; i <= rangeMax; i += step) out.add(i);
    }
    return out;
}

function splitOnWhitespace(s: string): string[] {
    const trimmed = s.trim();
    const out: string[] = [];
    let buf = "";
    for (let i = 0; i < trimmed.length; i += 1) {
        const ch = trimmed.charAt(i);
        if (ch === " " || ch === "\t") {
            if (buf.length > 0) {
                out.push(buf);
                buf = "";
            }
        } else {
            buf += ch;
        }
    }
    if (buf.length > 0) out.push(buf);
    return out;
}

function parseCronUncached(expr: string): CronExpr {
    const parts = splitOnWhitespace(expr);
    if (parts.length !== 5) throw new Error(`cron: expected 5 fields, got ${parts.length}`);
    return {
        minute: parseField(parts[0]!, 0, 59),
        hour: parseField(parts[1]!, 0, 23),
        dayOfMonth: parseField(parts[2]!, 1, 31),
        month: parseField(parts[3]!, 1, 12),
        dayOfWeek: parseField(parts[4]!, 0, 6),
    };
}

export function parseCron(expr: string): CronExpr {
    const cached = PARSE_CACHE.get(expr);
    if (cached) return cached;
    const parsed = parseCronUncached(expr);
    if (PARSE_CACHE.size >= PARSE_CACHE_CAP) {
        const firstKey = PARSE_CACHE.keys().next().value;
        if (firstKey !== undefined) PARSE_CACHE.delete(firstKey);
    }
    PARSE_CACHE.set(expr, parsed);
    return parsed;
}

interface LocalParts {
    readonly minute: number;
    readonly hour: number;
    readonly dayOfMonth: number;
    readonly month: number;
    readonly dayOfWeek: number;
}

const DOW_MAP: Readonly<Record<string, number>> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
};

function localParts(date: Date, timezone: string | null): LocalParts {
    if (!timezone) {
        return {
            minute: date.getUTCMinutes(),
            hour: date.getUTCHours(),
            dayOfMonth: date.getUTCDate(),
            month: date.getUTCMonth() + 1,
            dayOfWeek: date.getUTCDay(),
        };
    }
    const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        weekday: "short",
    });
    const parts = fmt.formatToParts(date);
    const lookup: Record<string, string> = {};
    for (const p of parts) lookup[p.type] = p.value;
    return {
        minute: Number(lookup.minute),
        hour: Number(lookup.hour),
        dayOfMonth: Number(lookup.day),
        month: Number(lookup.month),
        dayOfWeek: DOW_MAP[lookup.weekday ?? "Sun"] ?? 0,
    };
}

function matchesDay(expr: CronExpr, parts: LocalParts): boolean {
    const dayAllFull = expr.dayOfMonth.size === 31 && expr.dayOfWeek.size === 7;
    if (dayAllFull) return true;
    if (expr.dayOfMonth.size === 31) return expr.dayOfWeek.has(parts.dayOfWeek);
    if (expr.dayOfWeek.size === 7) return expr.dayOfMonth.has(parts.dayOfMonth);
    return expr.dayOfMonth.has(parts.dayOfMonth) || expr.dayOfWeek.has(parts.dayOfWeek);
}

function matches(expr: CronExpr, parts: LocalParts): boolean {
    if (!expr.minute.has(parts.minute)) return false;
    if (!expr.hour.has(parts.hour)) return false;
    if (!expr.month.has(parts.month)) return false;
    if (!matchesDay(expr, parts)) return false;
    return true;
}

function isSameLocalDate(a: LocalParts, b: LocalParts): boolean {
    return a.month === b.month && a.dayOfMonth === b.dayOfMonth;
}

function minuteOfDay(parts: LocalParts): number {
    return parts.hour * 60 + parts.minute;
}

function skippedAnyCronMinute(expr: CronExpr, prev: LocalParts, current: LocalParts): boolean {
    if (!isSameLocalDate(prev, current)) return false;
    const prevMin = minuteOfDay(prev);
    const currentMin = minuteOfDay(current);
    if (currentMin - prevMin <= 1) return false;
    for (let m = prevMin + 1; m < currentMin; m += 1) {
        const hour = Math.floor(m / 60);
        const minute = m % 60;
        if (!expr.hour.has(hour)) continue;
        if (!expr.minute.has(minute)) continue;
        if (!expr.month.has(current.month)) continue;
        if (!matchesDay(expr, current)) continue;
        return true;
    }
    return false;
}

export function nextFireAt(cron: string, afterMs: number, timezone?: string | null): number {
    const expr = parseCron(cron);
    const tz = timezone && timezone.length > 0 ? timezone : null;
    const start = new Date(afterMs);
    start.setUTCSeconds(0, 0);
    start.setUTCMinutes(start.getUTCMinutes() + 1);
    const limit = afterMs + MAX_FORWARD_MS;
    const cursor = start;
    let prev: LocalParts | null = null;
    while (cursor.getTime() <= limit) {
        const current = localParts(cursor, tz);
        if (matches(expr, current)) return cursor.getTime();
        if (tz && prev && skippedAnyCronMinute(expr, prev, current)) return cursor.getTime();
        prev = current;
        cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
    }
    throw new Error(`cron: no fire time within ${MAX_FORWARD_YEARS} years for "${cron}"`);
}
