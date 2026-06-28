import { BaseRegistry } from "../../base/base-registry.js";
import type { FlowFieldList } from "./payload-field-types.js";
import type { OperationContext, OperationResult, SafetyTier, SideEffectsDescriptor, ValidationDescriptor } from "./registry-types.js";

export type OperationHandler = (
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
) => Promise<OperationResult>;

export interface RegisteredOperation {
    readonly capability: string;
    readonly opId: string;
    readonly safety_tier: SafetyTier;
    readonly inputFields: FlowFieldList;
    readonly outputFields: FlowFieldList;
    readonly result_classes: readonly string[];
    readonly side_effects: SideEffectsDescriptor;
    readonly validation: ValidationDescriptor;
    readonly handler: OperationHandler;
    readonly compatibleAfterTriggers?: readonly string[];
}

class OperationRegistryStore extends BaseRegistry<string, RegisteredOperation> {}

export const operationRegistry = new OperationRegistryStore();

export function registerOperation(spec: RegisteredOperation): void {
    operationRegistry.registerUnique(
        spec.opId,
        spec,
        (key) => new Error(`operation "${key}" already registered`),
    );
}

export function operationsByCapability(capability: string): readonly RegisteredOperation[] {
    return operationRegistry.list().filter((o) => o.capability === capability);
}
