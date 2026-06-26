export interface AutoHookCondition {
    field: string;
    op: string;
    value: string;
}

function asString(v: unknown): string {
    return v === null || v === undefined ? "" : String(v);
}

function asNumber(v: unknown): number {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : NaN;
}

const STRING_OPS: Record<string, (raw: unknown, val: string) => boolean> = {
    eq: (raw, val) => asString(raw) === val,
    ne: (raw, val) => asString(raw) !== val,
    contains: (raw, val) => asString(raw).toLowerCase().includes(val.toLowerCase()),
};

const NUMBER_OPS: Record<string, (l: number, r: number) => boolean> = {
    gt: (l, r) => l > r,
    gte: (l, r) => l >= r,
    lt: (l, r) => l < r,
    lte: (l, r) => l <= r,
};

function evaluateOne(payload: Record<string, unknown>, c: AutoHookCondition): boolean {
    const raw = payload[c.field];
    const strOp = STRING_OPS[c.op];
    if (strOp) return strOp(raw, c.value);
    const numOp = NUMBER_OPS[c.op];
    if (!numOp) return false;
    const left = asNumber(raw);
    const right = asNumber(c.value);
    return !Number.isNaN(left) && !Number.isNaN(right) && numOp(left, right);
}

export function evaluateConditions(conditionsJson: string | null, payload: object): boolean {
    if (conditionsJson === null || conditionsJson.length === 0) return true;
    try {
        const conditions = JSON.parse(conditionsJson) as AutoHookCondition[];
        if (!Array.isArray(conditions) || conditions.length === 0) return true;
        const p = payload as Record<string, unknown>;
        return conditions.every((c) => evaluateOne(p, c));
    } catch {
        return true;
    }
}
