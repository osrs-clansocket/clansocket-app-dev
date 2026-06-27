const MINUTE_MS = 60_000;
const MAX_FORWARD_YEARS = 4;
const MAX_FORWARD_MS = MAX_FORWARD_YEARS * 365 * 24 * 60 * MINUTE_MS;

interface CronExpr {
    readonly minute: ReadonlySet<number>;
    readonly hour: ReadonlySet<number>;
    readonly dayOfMonth: ReadonlySet<number>;
    readonly month: ReadonlySet<number>;
    readonly dayOfWeek: ReadonlySet<number>;
}

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
            // full range
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

export function parseCron(expr: string): CronExpr {
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

function matchesDay(expr: CronExpr, date: Date): boolean {
    const dom = date.getUTCDate();
    const dow = date.getUTCDay();
    const dayAllFull = expr.dayOfMonth.size === 31 && expr.dayOfWeek.size === 7;
    if (dayAllFull) return true;
    if (expr.dayOfMonth.size === 31) return expr.dayOfWeek.has(dow);
    if (expr.dayOfWeek.size === 7) return expr.dayOfMonth.has(dom);
    return expr.dayOfMonth.has(dom) || expr.dayOfWeek.has(dow);
}

function matches(expr: CronExpr, date: Date): boolean {
    if (!expr.minute.has(date.getUTCMinutes())) return false;
    if (!expr.hour.has(date.getUTCHours())) return false;
    if (!expr.month.has(date.getUTCMonth() + 1)) return false;
    if (!matchesDay(expr, date)) return false;
    return true;
}

export function nextFireAt(cron: string, afterMs: number): number {
    const expr = parseCron(cron);
    const start = new Date(afterMs);
    start.setUTCSeconds(0, 0);
    start.setUTCMinutes(start.getUTCMinutes() + 1);
    const limit = afterMs + MAX_FORWARD_MS;
    const cursor = start;
    while (cursor.getTime() <= limit) {
        if (matches(expr, cursor)) return cursor.getTime();
        cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
    }
    throw new Error(`cron: no fire time within ${MAX_FORWARD_YEARS} years for "${cron}"`);
}
