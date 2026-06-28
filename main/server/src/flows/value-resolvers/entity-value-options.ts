import { lookupEntityAttribute } from "../registries/entity-attribute-schema.js";
import { lookupTriggerSpec } from "../registries/trigger-registry.js";
import { ENVELOPE_PAYLOAD_FIELDS, type FlowField } from "../registries/payload-field-types.js";
import { resolveValueSource } from "../registries/value-source-registry.js";
import { clanPluginDb, pluginModes } from "../../database/core/clans.js";

export type ValueOptionsScope = "trigger" | "entity" | "event";

interface DistinctRow {
    v: unknown;
}

async function distinctFromPluginTable(clanId: string, table: string, column: string): Promise<readonly string[]> {
    const sql = `SELECT DISTINCT "${column}" AS v FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" != '' ORDER BY "${column}"`;
    const set = new Set<string>();
    for (const mode of pluginModes(clanId)) {
        const db = clanPluginDb(clanId, mode);
        const rows = db.prepare(sql).all() as DistinctRow[];
        for (const r of rows) set.add(String(r.v));
    }
    return [...set].sort((a, b) => a.localeCompare(b));
}

async function resolveFromField(field: FlowField, clanId: string): Promise<readonly string[]> {
    if (field.valueSourceRef) {
        const items = await resolveValueSource(field.valueSourceRef, clanId);
        return items.map((i) => i.id);
    }
    if (field.sqlTable && field.sqlColumn) {
        return distinctFromPluginTable(clanId, field.sqlTable, field.sqlColumn);
    }
    return [];
}

function findField(payloadFields: readonly FlowField[], fieldName: string): FlowField | undefined {
    for (const f of payloadFields) if (f.name === fieldName) return f;
    return undefined;
}

async function resolveForTrigger(triggerId: string, field: string, clanId: string): Promise<readonly string[]> {
    const spec = lookupTriggerSpec(triggerId);
    if (!spec) return [];
    const declared = findField(spec.payloadFields, field);
    if (declared) return resolveFromField(declared, clanId);
    if (spec.capability === "plugin") {
        const env = findField(ENVELOPE_PAYLOAD_FIELDS, field);
        if (env) return resolveFromField(env, clanId);
    }
    return [];
}

async function resolveForEntity(field: string, clanId: string): Promise<readonly string[]> {
    const attr = lookupEntityAttribute(field);
    if (!attr) return [];
    if (attr.resolver) return attr.resolver(clanId);
    return [];
}

export async function resolveValueOptions(
    scope: ValueOptionsScope,
    clanId: string,
    field: string,
    triggerType: string | null,
): Promise<readonly string[]> {
    if (scope === "entity") return resolveForEntity(field, clanId);
    if (scope === "trigger" || scope === "event") {
        if (!triggerType) return [];
        return resolveForTrigger(triggerType, field, clanId);
    }
    return [];
}
