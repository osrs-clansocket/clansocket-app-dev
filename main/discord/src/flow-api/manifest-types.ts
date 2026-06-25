import type { OperationSpec } from "./operation-spec-types.js";
import type { TriggerSpec } from "./trigger-spec-types.js";

export type { JSONSchema, SideEffectsDescriptor, ValidationDescriptor } from "./side-effect-types.js";
export type { OperationSpec } from "./operation-spec-types.js";
export type { TriggerSpec } from "./trigger-spec-types.js";

export interface CapabilityManifest {
    readonly name: string;
    readonly version: string;
    readonly operations: Readonly<Record<string, OperationSpec>>;
    readonly triggers: Readonly<Record<string, TriggerSpec>>;
}
