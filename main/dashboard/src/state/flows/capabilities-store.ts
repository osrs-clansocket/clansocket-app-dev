import { signal, type Signal } from "../../dom/factory";
import { fetchCapabilities, type CapabilitySummary, type TriggerSummary } from "./flows-client.js";
import { registerFieldsForTrigger } from "../../shared/constants/clan-manage-discord/condition-field-list.js";

export interface EntityAttribute {
    readonly path: string;
    readonly label: string;
    readonly type: string;
}

export const capabilitiesSignal: Signal<readonly CapabilitySummary[]> = signal<readonly CapabilitySummary[]>([]);
export const entityAttributesSignal: Signal<readonly EntityAttribute[]> = signal<readonly EntityAttribute[]>([]);

let loaded = false;

async function fetchEntityAttributes(): Promise<readonly EntityAttribute[]> {
    try {
        const response = await fetch("/api/flows/entity-attributes");
        if (!response.ok) return [];
        const body = (await response.json()) as { attributes: readonly EntityAttribute[] };
        return body.attributes;
    } catch {
        return [];
    }
}

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
        const attrs = await fetchEntityAttributes();
        entityAttributesSignal.set(attrs);
    } catch {
        loaded = false;
    }
}

export function fieldOptionsForScope(triggerId: string | null): readonly { value: string; label: string }[] {
    const out: { value: string; label: string }[] = [];
    if (triggerId) {
        for (const cap of capabilitiesSignal()) {
            const spec = cap.triggers[triggerId];
            if (!spec) continue;
            const props = spec.payload_schema.properties as Readonly<Record<string, unknown>> | undefined;
            if (props) {
                for (const fieldName of Object.keys(props)) {
                    out.push({ value: `ctx.event.${fieldName}`, label: `event.${fieldName}` });
                }
            }
        }
    }
    for (const attr of entityAttributesSignal()) {
        out.push({ value: attr.path, label: attr.label });
    }
    return out;
}

export interface TriggerOption {
    readonly value: string;
    readonly label: string;
    readonly group: string;
}

export interface OperationOption {
    readonly value: string;
    readonly label: string;
    readonly group: string;
    readonly safetyTier: "live" | "manual";
    readonly capabilityColor: string;
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

export function flatOperationOptions(): readonly OperationOption[] {
    const out: OperationOption[] = [];
    for (const capability of capabilitiesSignal()) {
        for (const [opId, spec] of Object.entries(capability.operations)) {
            out.push({
                value: opId,
                label: opId,
                group: capability.name,
                safetyTier: spec.safety_tier,
                capabilityColor: capability.capability_color,
            });
        }
    }
    return out;
}

export function operationsByCapability(): Readonly<Record<string, readonly OperationOption[]>> {
    const grouped: Record<string, OperationOption[]> = {};
    for (const opt of flatOperationOptions()) {
        if (!grouped[opt.group]) grouped[opt.group] = [];
        grouped[opt.group]!.push(opt);
    }
    return grouped;
}

export function lookupCapability(capabilityName: string): import("./flows-client.js").CapabilitySummary | null {
    for (const cap of capabilitiesSignal()) if (cap.name === capabilityName) return cap;
    return null;
}

export function lookupOperation(qualifiedOpId: string): import("./flows-client.js").OperationSummary | null {
    const colonIdx = qualifiedOpId.indexOf(":");
    if (colonIdx < 0) return null;
    const capName = qualifiedOpId.slice(0, colonIdx);
    const cap = lookupCapability(capName);
    if (!cap) return null;
    return cap.operations[qualifiedOpId] ?? null;
}
