import type { ConditionRow } from "../../dom/pages/clans/manage/discord/modes/auto-hooks/condition-editor-value.js";

type FilterOperator =
    | "="
    | "!="
    | ">"
    | ">="
    | "<"
    | "<="
    | "in"
    | "not-in"
    | "contains"
    | "not-contains"
    | "starts-with"
    | "matches-tier";

type FilterConditionSource =
    | "event-property"
    | "entity-attribute"
    | "variable"
    | "tracker-value"
    | "time-relative"
    | "member-channel-opt-out"
    | "member-newsletter-opt-in";

interface FilterCondition {
    readonly type: FilterConditionSource;
    readonly field: string;
    readonly operator: FilterOperator;
    readonly value: unknown;
}

interface FilterConditionGroup {
    readonly conditions: readonly FilterCondition[];
}

interface FilterAst {
    readonly condition_groups: readonly FilterConditionGroup[];
}

const OP_MAP: Readonly<Record<string, FilterOperator>> = {
    eq: "=",
    ne: "!=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    in: "in",
    "not-in": "not-in",
    contains: "contains",
    "not-contains": "not-contains",
    "starts-with": "starts-with",
    "matches-tier": "matches-tier",
};

const SOURCE_PREFIX: Readonly<Record<FilterConditionSource, string>> = {
    "event-property": "ctx.event.",
    "variable": "ctx.variables.",
    "tracker-value": "ctx.trackers.",
    "entity-attribute": "entity.",
    "member-channel-opt-out": "entity.preferences.channel_opt_out.",
    "member-newsletter-opt-in": "entity.preferences.newsletter_opt_in.",
    "time-relative": "time.",
};

const SOURCE_PREFIX_LONGEST_FIRST: readonly (readonly [FilterConditionSource, string])[] = (
    Object.entries(SOURCE_PREFIX) as (readonly [FilterConditionSource, string])[]
).slice().sort((a, b) => b[1].length - a[1].length);

function inferSource(field: string): FilterConditionSource {
    for (const [source, prefix] of SOURCE_PREFIX_LONGEST_FIRST) {
        if (field.startsWith(prefix)) return source;
    }
    return "entity-attribute";
}

function stripFieldPrefix(field: string, source: FilterConditionSource): string {
    const prefix = SOURCE_PREFIX[source];
    return field.startsWith(prefix) ? field.slice(prefix.length) : field;
}

function coerceValue(raw: string, operator: FilterOperator): unknown {
    if (raw === "") return raw;
    if (operator === ">" || operator === ">=" || operator === "<" || operator === "<=") {
        const n = Number(raw);
        return Number.isFinite(n) ? n : raw;
    }
    return raw;
}

function rowToCondition(row: ConditionRow): FilterCondition | null {
    if (row.field.length === 0 || row.op.length === 0) return null;
    const operator = OP_MAP[row.op] ?? "=";
    const source = inferSource(row.field);
    const field = stripFieldPrefix(row.field, source);
    return { type: source, field, operator, value: coerceValue(row.value, operator) };
}

export function conditionsToFilterDsl(rows: readonly ConditionRow[]): FilterAst | null {
    const conditions: FilterCondition[] = [];
    for (const row of rows) {
        const c = rowToCondition(row);
        if (c) conditions.push(c);
    }
    if (conditions.length === 0) return null;
    return { condition_groups: [{ conditions }] };
}
