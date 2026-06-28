import type {
    CapabilityManifest,
    JSONSchema,
    OperationSpec,
    TriggerSpec,
} from "./registry-types.js";
import { ENVELOPE_PAYLOAD_FIELDS, type FlowField, type FlowFieldList } from "./payload-field-types.js";
import { operationsByCapability, type RegisteredOperation } from "./operation-registry.js";
import { triggersByCapability } from "./trigger-registry.js";

const ENVELOPE_CAPABILITY = "plugin";

export interface CapabilityIdentity {
    readonly name: string;
    readonly version: string;
    readonly capability_color: string;
}

function schemaTypeFor(fieldType: string): string {
    if (fieldType === "integer" || fieldType === "number") return "integer";
    if (fieldType === "boolean") return "boolean";
    if (fieldType === "object") return "object";
    return "string";
}

function fieldToProperty(field: FlowField): JSONSchema {
    const out: Record<string, unknown> = { type: schemaTypeFor(field.type), "x-flow-type": field.type };
    if (field.valueSourceRef) out.format = field.valueSourceRef;
    if (field.minLength !== undefined) out.minLength = field.minLength;
    if (field.maxLength !== undefined) out.maxLength = field.maxLength;
    if (field.minimum !== undefined) out.minimum = field.minimum;
    if (field.maximum !== undefined) out.maximum = field.maximum;
    if (field.description) out.description = field.description;
    return out;
}

function fieldsToSchema(fields: FlowFieldList): JSONSchema {
    const properties: Record<string, JSONSchema> = {};
    const required: string[] = [];
    for (const f of fields) {
        properties[f.name] = fieldToProperty(f);
        if (f.required) required.push(f.name);
    }
    const schema: Record<string, unknown> = { type: "object", additionalProperties: false, properties };
    if (required.length > 0) schema.required = required;
    return schema;
}

function operationToSpec(op: RegisteredOperation): OperationSpec {
    return {
        safety_tier: op.safety_tier,
        input_schema: fieldsToSchema(op.inputFields),
        output_schema: fieldsToSchema(op.outputFields),
        side_effects: op.side_effects,
        validation: op.validation,
        result_classes: op.result_classes,
        handler: op.handler,
    };
}

function buildOperations(capability: string): Readonly<Record<string, OperationSpec>> {
    const out: Record<string, OperationSpec> = {};
    for (const op of operationsByCapability(capability)) out[op.opId] = operationToSpec(op);
    return out;
}

function mergeEnvelope(capability: string, payloadFields: FlowFieldList): FlowFieldList {
    if (capability !== ENVELOPE_CAPABILITY) return payloadFields;
    const declared = new Set(payloadFields.map((f) => f.name));
    const merged: FlowField[] = [];
    for (const env of ENVELOPE_PAYLOAD_FIELDS) {
        if (!declared.has(env.name)) merged.push(env);
    }
    for (const f of payloadFields) merged.push(f);
    return merged;
}

function buildTriggers(capability: string): Readonly<Record<string, TriggerSpec>> {
    const out: Record<string, TriggerSpec> = {};
    for (const t of triggersByCapability(capability)) {
        out[t.triggerId] = {
            event_source: t.eventSource,
            payload_schema: fieldsToSchema(mergeEnvelope(capability, t.payloadFields)),
            triggerable: true,
        };
    }
    return out;
}

export function buildCapabilityFromRegistries(identity: CapabilityIdentity): CapabilityManifest {
    return {
        name: identity.name,
        version: identity.version,
        capability_color: identity.capability_color,
        operations: buildOperations(identity.name),
        triggers: buildTriggers(identity.name),
    };
}
