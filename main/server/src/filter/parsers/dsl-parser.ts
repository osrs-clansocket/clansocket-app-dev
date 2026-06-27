import {
    FILTER_CONDITION_SOURCES,
    FILTER_OPERATORS,
    type FilterAst,
    type FilterCondition,
    type FilterConditionGroup,
    type FilterConditionSource,
    type FilterOperator,
} from "../dsl-types.js";

const CONDITION_SOURCES = new Set<string>(FILTER_CONDITION_SOURCES);
const OPERATORS = new Set<string>(FILTER_OPERATORS);

export class FilterParseError extends Error {
    public readonly path: string;
    constructor(path: string, message: string) {
        super(`filter ${path}: ${message}`);
        this.name = "FilterParseError";
        this.path = path;
    }
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCondition(raw: unknown, path: string): FilterCondition {
    if (!isObject(raw)) throw new FilterParseError(path, "expected object");
    const type = raw.type;
    if (typeof type !== "string" || !CONDITION_SOURCES.has(type)) {
        throw new FilterParseError(path, `unknown type ${String(type)}`);
    }
    const field = raw.field;
    if (typeof field !== "string" || field.length === 0) {
        throw new FilterParseError(path, "field must be non-empty string");
    }
    const operator = raw.operator;
    if (typeof operator !== "string" || !OPERATORS.has(operator)) {
        throw new FilterParseError(path, `unknown operator ${String(operator)}`);
    }
    return {
        type: type as FilterConditionSource,
        field,
        operator: operator as FilterOperator,
        value: raw.value,
    };
}

function parseConditionGroup(raw: unknown, path: string): FilterConditionGroup {
    if (!isObject(raw)) throw new FilterParseError(path, "expected object");
    const conditions = raw.conditions;
    if (!Array.isArray(conditions) || conditions.length === 0) {
        throw new FilterParseError(path, "conditions must be non-empty array");
    }
    return {
        conditions: conditions.map((c, i) => parseCondition(c, `${path}.conditions[${i}]`)),
    };
}

export function parseFilter(raw: unknown): FilterAst {
    if (!isObject(raw)) throw new FilterParseError("$", "expected object");
    const groups = raw.condition_groups;
    if (!Array.isArray(groups) || groups.length === 0) {
        throw new FilterParseError("$", "condition_groups must be non-empty array");
    }
    return {
        condition_groups: groups.map((g, i) => parseConditionGroup(g, `$.condition_groups[${i}]`)),
    };
}
