import { FILTER_CONDITION_SOURCES, FILTER_OPERATORS } from "./dsl-types.js";

type JSONSchema = Readonly<Record<string, unknown>>;

const CONDITION_SCHEMA: JSONSchema = {
    type: "object",
    required: ["type", "field", "operator", "value"],
    additionalProperties: false,
    properties: {
        type: { type: "string", enum: [...FILTER_CONDITION_SOURCES] },
        field: { type: "string", minLength: 1 },
        operator: { type: "string", enum: [...FILTER_OPERATORS] },
        value: {},
    },
};

const CONDITION_GROUP_SCHEMA: JSONSchema = {
    type: "object",
    required: ["conditions"],
    additionalProperties: false,
    properties: {
        conditions: {
            type: "array",
            minItems: 1,
            items: CONDITION_SCHEMA,
        },
    },
};

export const FILTER_DSL_SCHEMA: JSONSchema = {
    type: "object",
    required: ["condition_groups"],
    additionalProperties: false,
    properties: {
        condition_groups: {
            type: "array",
            minItems: 1,
            items: CONDITION_GROUP_SCHEMA,
        },
    },
};
