import type {
    FilterAst,
    FilterCondition,
    FilterConditionGroup,
    FilterConditionSource,
    FilterContext,
    FilterOperator,
} from "../dsl-types.js";

function resolveSourceRoot(source: FilterConditionSource, ctx: FilterContext): unknown {
    switch (source) {
        case "event-property":
            return ctx.event;
        case "entity-attribute":
            return ctx.entity;
        case "variable":
            return ctx.variables;
        case "tracker-value":
            return ctx.trackers;
        case "time-relative":
            return { now: ctx.now };
        case "member-channel-opt-out":
            return readPath(ctx.entity, "preferences.channel_opt_out");
        case "member-newsletter-opt-in":
            return readPath(ctx.entity, "preferences.newsletter_opt_in");
    }
}

function readPath(root: unknown, path: string): unknown {
    if (path.length === 0) return root;
    let cursor: unknown = root;
    let segStart = 0;
    for (let i = 0; i <= path.length; i += 1) {
        const atEnd = i === path.length;
        const isDot = !atEnd && path.charCodeAt(i) === 46;
        if (!atEnd && !isDot) continue;
        const segment = path.slice(segStart, i);
        if (segment.length === 0) return undefined;
        if (cursor === null || cursor === undefined) return undefined;
        if (typeof cursor !== "object") return undefined;
        cursor = (cursor as Record<string, unknown>)[segment];
        segStart = i + 1;
    }
    return cursor;
}

function asNumber(v: unknown): number | null {
    return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function compare(left: unknown, op: FilterOperator, right: unknown): boolean {
    switch (op) {
        case "=":
            return left === right;
        case "!=":
            return left !== right;
        case ">":
        case ">=":
        case "<":
        case "<=": {
            const l = asNumber(left);
            const r = asNumber(right);
            if (l === null || r === null) return false;
            if (op === ">") return l > r;
            if (op === ">=") return l >= r;
            if (op === "<") return l < r;
            return l <= r;
        }
        case "in":
            return Array.isArray(right) && right.includes(left);
        case "not-in":
            return Array.isArray(right) && !right.includes(left);
        case "contains":
            if (typeof left === "string" && typeof right === "string") return left.includes(right);
            if (Array.isArray(left)) return left.includes(right);
            return false;
        case "not-contains":
            if (typeof left === "string" && typeof right === "string") return !left.includes(right);
            if (Array.isArray(left)) return !left.includes(right);
            return false;
        case "starts-with":
            return typeof left === "string" && typeof right === "string" && left.startsWith(right);
        case "matches-tier":
            return left === right;
    }
}

function evaluateCondition(condition: FilterCondition, ctx: FilterContext): boolean {
    const root = resolveSourceRoot(condition.type, ctx);
    const left = readPath(root, condition.field);
    return compare(left, condition.operator, condition.value);
}

function evaluateGroup(group: FilterConditionGroup, ctx: FilterContext): boolean {
    for (const condition of group.conditions) {
        if (!evaluateCondition(condition, ctx)) return false;
    }
    return true;
}

export function evaluateFilter(ast: FilterAst, ctx: FilterContext): boolean {
    if (ast.condition_groups.length === 0) return true;
    for (const group of ast.condition_groups) {
        if (evaluateGroup(group, ctx)) return true;
    }
    return false;
}
