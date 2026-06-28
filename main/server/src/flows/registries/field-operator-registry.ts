import type { FlowFieldType } from "./payload-field-types.js";

export type FilterOperator =
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "not-in"
    | "contains"
    | "not-contains"
    | "starts-with";

const REGISTRY = new Map<FlowFieldType, readonly FilterOperator[]>();

export function registerFieldOperators(fieldType: FlowFieldType, operators: readonly FilterOperator[]): void {
    if (REGISTRY.has(fieldType)) {
        throw new Error(`field-operator binding for "${fieldType}" already registered`);
    }
    REGISTRY.set(fieldType, operators);
}

export function operatorsForFieldType(fieldType: FlowFieldType): readonly FilterOperator[] {
    return REGISTRY.get(fieldType) ?? ["eq", "ne"];
}

export function allRegisteredFieldTypes(): readonly FlowFieldType[] {
    return [...REGISTRY.keys()];
}
