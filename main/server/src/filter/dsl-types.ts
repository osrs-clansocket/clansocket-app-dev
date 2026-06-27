export type FilterConditionSource =
    | "event-property"
    | "entity-attribute"
    | "variable"
    | "tracker-value"
    | "time-relative"
    | "member-channel-opt-out"
    | "member-newsletter-opt-in";

export type FilterOperator =
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

export interface FilterCondition {
    readonly type: FilterConditionSource;
    readonly field: string;
    readonly operator: FilterOperator;
    readonly value: unknown;
}

export interface FilterConditionGroup {
    readonly conditions: readonly FilterCondition[];
}

export interface FilterAst {
    readonly condition_groups: readonly FilterConditionGroup[];
}

export interface FilterContext {
    readonly entity: Readonly<Record<string, unknown>>;
    readonly event: Readonly<Record<string, unknown>>;
    readonly variables: Readonly<Record<string, unknown>>;
    readonly trackers: Readonly<Record<string, unknown>>;
    readonly now: number;
}

export const FILTER_CONDITION_SOURCES: readonly FilterConditionSource[] = [
    "event-property",
    "entity-attribute",
    "variable",
    "tracker-value",
    "time-relative",
    "member-channel-opt-out",
    "member-newsletter-opt-in",
];

export const FILTER_OPERATORS: readonly FilterOperator[] = [
    "=",
    "!=",
    ">",
    ">=",
    "<",
    "<=",
    "in",
    "not-in",
    "contains",
    "not-contains",
    "starts-with",
    "matches-tier",
];
