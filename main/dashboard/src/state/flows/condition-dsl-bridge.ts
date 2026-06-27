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

function inferSource(field: string): FilterConditionSource {
    if (field.startsWith("ctx.event.")) return "event-property";
    if (field.startsWith("entity.preferences.channel_opt_out.")) return "member-channel-opt-out";
    if (field.startsWith("entity.preferences.newsletter_opt_in.")) return "member-newsletter-opt-in";
    if (field.startsWith("entity.")) return "entity-attribute";
    if (field.startsWith("ctx.variables.")) return "variable";
    if (field.startsWith("ctx.trackers.")) return "tracker-value";
    if (field.startsWith("time.")) return "time-relative";
    return "entity-attribute";
}

function stripFieldPrefix(field: string, source: FilterConditionSource): string {
    if (source === "event-property") return field.replace(/^ctx\.event\./, "");
    if (source === "variable") return field.replace(/^ctx\.variables\./, "");
    if (source === "tracker-value") return field.replace(/^ctx\.trackers\./, "");
    if (source === "entity-attribute") return field.replace(/^entity\./, "");
    if (source === "member-channel-opt-out") return field.replace(/^entity\.preferences\.channel_opt_out\./, "");
    if (source === "member-newsletter-opt-in") return field.replace(/^entity\.preferences\.newsletter_opt_in\./, "");
    return field;
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
