import { capabilityRegistry, lookupOperation, lookupTrigger } from "../registries/capability-registry.js";
import type { FlowDefinition } from "../store/flow-definition-types.js";

export interface ReferenceValidationError {
    readonly path: string;
    readonly message: string;
}

function triggerExists(triggerId: string): boolean {
    if (lookupTrigger(triggerId) !== null) return true;
    for (const cap of capabilityRegistry.list()) {
        if (cap.triggers[triggerId]) return true;
    }
    return false;
}

function operationExists(opId: string): boolean {
    return lookupOperation(opId) !== null;
}

export function validateFlowReferences(definition: FlowDefinition): readonly ReferenceValidationError[] {
    const errors: ReferenceValidationError[] = [];
    if (definition.trigger_type === "event") {
        const triggerId = definition.trigger_config.event_source ?? "";
        if (triggerId.length === 0) {
            errors.push({ path: "$.trigger_config.event_source", message: "event trigger requires event_source" });
        } else if (!triggerExists(triggerId)) {
            errors.push({
                path: "$.trigger_config.event_source",
                message: `unknown trigger "${triggerId}" — not in capability registry`,
            });
        }
    }
    for (let i = 0; i < definition.nodes.length; i += 1) {
        const node = definition.nodes[i]!;
        if (node.kind === "action") {
            const ref = node.operation_ref ?? "";
            if (ref.length === 0) {
                errors.push({ path: `$.nodes[${i}].operation_ref`, message: "action node requires operation_ref" });
            } else if (!operationExists(ref)) {
                errors.push({
                    path: `$.nodes[${i}].operation_ref`,
                    message: `unknown operation "${ref}" — not in capability registry`,
                });
            }
        }
    }
    return errors;
}
