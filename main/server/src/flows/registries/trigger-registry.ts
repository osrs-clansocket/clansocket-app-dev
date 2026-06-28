import { BaseRegistry } from "../../base/base-registry.js";
import type { FlowFieldList } from "./payload-field-types.js";

export type TriggerRouting = "current-state" | "event" | "bucket" | "gateway" | "synthetic";

export interface RegisteredTrigger {
    readonly capability: string;
    readonly triggerId: string;
    readonly eventSource: string;
    readonly routing: TriggerRouting;
    readonly payloadFields: FlowFieldList;
}

class TriggerRegistryStore extends BaseRegistry<string, RegisteredTrigger> {}

export const triggerRegistry = new TriggerRegistryStore();

export function registerTrigger(spec: RegisteredTrigger): void {
    triggerRegistry.registerUnique(
        spec.triggerId,
        spec,
        (key) => new Error(`trigger "${key}" already registered`),
    );
}

export function triggersByCapability(capability: string): readonly RegisteredTrigger[] {
    return triggerRegistry.list().filter((t) => t.capability === capability);
}

export function lookupTriggerSpec(triggerId: string): RegisteredTrigger | undefined {
    return triggerRegistry.get(triggerId) ?? undefined;
}
