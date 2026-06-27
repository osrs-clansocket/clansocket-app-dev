import { signal, type Signal } from "../../dom/factory";
import { fetchCapabilities, type CapabilitySummary, type TriggerSummary } from "./flows-client.js";
import { registerFieldsForTrigger } from "../../shared/constants/clan-manage-discord/condition-field-list.js";

export const capabilitiesSignal: Signal<readonly CapabilitySummary[]> = signal<readonly CapabilitySummary[]>([]);

let loaded = false;

function humanizeKey(key: string): string {
    const spaced = key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function collectSchemaFields(
    schema: Readonly<Record<string, unknown>>,
    prefix: string,
): readonly { field: string; label: string }[] {
    const result: { field: string; label: string }[] = [];
    const props = schema.properties;
    if (!props || typeof props !== "object") return result;
    for (const [name, raw] of Object.entries(props as Record<string, Readonly<Record<string, unknown>>>)) {
        const path = prefix.length === 0 ? name : `${prefix}.${name}`;
        result.push({ field: path, label: humanizeKey(name) });
        if (raw && raw.type === "object") {
            for (const child of collectSchemaFields(raw, path)) result.push(child);
        }
    }
    return result;
}

function registerTriggerFields(triggerId: string, spec: TriggerSummary): void {
    const fields = collectSchemaFields(spec.payload_schema, "");
    if (fields.length === 0) return;
    registerFieldsForTrigger(triggerId, fields);
}

function registerAllTriggerFields(capabilities: readonly CapabilitySummary[]): void {
    for (const cap of capabilities) {
        for (const [triggerId, spec] of Object.entries(cap.triggers)) {
            if (!spec.triggerable) continue;
            registerTriggerFields(triggerId, spec);
        }
    }
}

export async function ensureCapabilitiesLoaded(): Promise<void> {
    if (loaded) return;
    loaded = true;
    try {
        const response = await fetchCapabilities();
        capabilitiesSignal.set(response.capabilities);
        registerAllTriggerFields(response.capabilities);
    } catch {
        loaded = false;
    }
}

export interface TriggerOption {
    readonly value: string;
    readonly label: string;
    readonly group: string;
}

export function flatTriggerOptions(): readonly TriggerOption[] {
    const fromRegistry: TriggerOption[] = [];
    for (const capability of capabilitiesSignal()) {
        for (const [triggerId, spec] of Object.entries(capability.triggers)) {
            if (!spec.triggerable) continue;
            fromRegistry.push({ value: triggerId, label: triggerId, group: capability.name });
        }
    }
    return fromRegistry;
}
