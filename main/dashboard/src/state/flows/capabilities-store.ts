import { signal, type Signal } from "../../dom/factory";
import { fetchCapabilities, type CapabilitySummary, type TriggerSummary } from "./flows-client.js";
import { registerFieldsForTrigger, type ConditionField } from "../../shared/constants/clan-manage-discord/condition-field-list.js";
import { humanize } from "./humanize.js";
import { ensureFieldOperatorsLoaded } from "./field-operators-store.js";

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

export interface FilterOperatorDef {
    readonly value: string;
    readonly label: string;
}

export interface ComponentKindDef {
    readonly kind: string;
    readonly label: string;
    readonly color: string;
    readonly default_output_handles: readonly string[];
}

export const operatorsSignal: Signal<readonly FilterOperatorDef[]> = signal<readonly FilterOperatorDef[]>([]);
export const componentKindsSignal: Signal<readonly ComponentKindDef[]> = signal<readonly ComponentKindDef[]>([]);

async function fetchOperators(): Promise<readonly FilterOperatorDef[]> {
    try {
        const response = await fetch("/api/flows/operators");
        if (!response.ok) return [];
        const body = (await response.json()) as { operators: readonly string[] };
        return body.operators.map((op) => ({ value: op, label: op }));
    } catch {
        return [];
    }
}

async function fetchComponentKinds(): Promise<readonly ComponentKindDef[]> {
    try {
        const response = await fetch("/api/flows/component-kinds");
        if (!response.ok) return [];
        const body = (await response.json()) as { kinds: readonly ComponentKindDef[] };
        return body.kinds;
    } catch {
        return [];
    }
}


function readFieldType(raw: Readonly<Record<string, unknown>>): string {
    const xType = raw["x-flow-type"];
    if (typeof xType === "string") return xType;
    const format = raw.format;
    if (typeof format === "string") return format;
    const type = raw.type;
    if (typeof type === "string") return type;
    return "string";
}

function readFormat(raw: Readonly<Record<string, unknown>>): string | undefined {
    const format = raw.format;
    return typeof format === "string" ? format : undefined;
}

function collectSchemaFields(
    schema: Readonly<Record<string, unknown>>,
    prefix: string,
): readonly ConditionField[] {
    const result: ConditionField[] = [];
    const props = schema.properties;
    if (!props || typeof props !== "object") return result;
    for (const [name, raw] of Object.entries(props as Record<string, Readonly<Record<string, unknown>>>)) {
        const path = prefix.length === 0 ? name : `${prefix}.${name}`;
        const entry: ConditionField = {
            field: path,
            label: humanize(name),
            fieldType: readFieldType(raw),
        };
        const format = readFormat(raw);
        if (format !== undefined) entry.format = format;
        result.push(entry);
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
        const [attrs, ops, kinds] = await Promise.all([
            fetchEntityAttributes(),
            fetchOperators(),
            fetchComponentKinds(),
            ensureFieldOperatorsLoaded(),
        ]);
        entityAttributesSignal.set(attrs);
        operatorsSignal.set(ops);
        componentKindsSignal.set(kinds);
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

export function fieldTypeForScope(triggerId: string | null, field: string): string | undefined {
    if (triggerId && field.startsWith("ctx.event.")) {
        const fieldName = field.slice("ctx.event.".length);
        for (const cap of capabilitiesSignal()) {
            const spec = cap.triggers[triggerId];
            if (!spec) continue;
            const props = spec.payload_schema.properties as Readonly<Record<string, Readonly<Record<string, unknown>>>> | undefined;
            const prop = props?.[fieldName];
            if (!prop) continue;
            const xType = prop["x-flow-type"];
            if (typeof xType === "string") return xType;
            const fmt = prop.format;
            if (typeof fmt === "string") return fmt;
            const t = prop.type;
            if (typeof t === "string") return t;
        }
    }
    for (const attr of entityAttributesSignal()) {
        if (attr.path === field) return attr.type;
    }
    return undefined;
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
