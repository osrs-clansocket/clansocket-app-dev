import { BaseRegistry } from "../../base/base-registry.js";
import type { RegisteredEntryType } from "../shared/vault-types.js";

class VaultTypeRegistry extends BaseRegistry<string, RegisteredEntryType<unknown>> {
    registerType(entry: RegisteredEntryType<unknown>): void {
        this.registerUnique(entry.entry_key, entry, (k) => new Error(`vault entry type already registered: ${k}`));
    }
}

const registry = new VaultTypeRegistry();

export function register<T>(entry: RegisteredEntryType<T>): void {
    registry.registerType(entry as RegisteredEntryType<unknown>);
}

export function vaultEntryType(entry_key: string): RegisteredEntryType<unknown> | null {
    return registry.get(entry_key);
}

export function listKeys(): readonly string[] {
    return registry.keys();
}
