import { BaseRegistry } from "../../base/base-registry.js";
import { manifest as discordManifest } from "../../discord/flow-api/manifest.js";
import type {
    CapabilityManifest,
    OperationSpec,
    TriggerSpec,
} from "./registry-types.js";

class CapabilityRegistryStore extends BaseRegistry<string, CapabilityManifest> {}

const STORE = new CapabilityRegistryStore();

function registerManifest(manifest: CapabilityManifest): void {
    STORE.registerUnique(manifest.name, manifest, (key) => new Error(`capability "${key}" already registered`));
}

registerManifest(discordManifest);

export const capabilityRegistry = STORE;

export function lookupOperation(qualifiedOpId: string): OperationSpec | null {
    const [capability, opId] = splitQualifiedId(qualifiedOpId);
    if (!capability || !opId) return null;
    const manifest = STORE.get(capability);
    if (!manifest) return null;
    return manifest.operations[qualifiedOpId] ?? null;
}

export function lookupTrigger(qualifiedTriggerId: string): TriggerSpec | null {
    const [capability, triggerId] = splitQualifiedId(qualifiedTriggerId);
    if (!capability || !triggerId) return null;
    const manifest = STORE.get(capability);
    if (!manifest) return null;
    return manifest.triggers[qualifiedTriggerId] ?? null;
}

function splitQualifiedId(qualified: string): [string | null, string | null] {
    const colonIndex = qualified.indexOf(":");
    if (colonIndex < 1 || colonIndex === qualified.length - 1) return [null, null];
    return [qualified.slice(0, colonIndex), qualified.slice(colonIndex + 1)];
}
