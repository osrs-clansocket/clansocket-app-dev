import { entityAttributeRegistry, type RegisteredEntityAttribute } from "./entity-attribute-registry.js";
import { getClanDb, clanPluginDb, pluginModes } from "../../database/core/clans.js";

export type EntityAttributeResolver = (clanId: string) => readonly string[];

export interface EntityAttribute {
    readonly path: string;
    readonly label: string;
    readonly type: "string" | "integer" | "boolean" | "timestamp";
    readonly resolver: EntityAttributeResolver | null;
}

interface DistinctRow {
    v: unknown;
}

function clanDistinct(table: string, column: string): EntityAttributeResolver {
    const sql = `SELECT DISTINCT "${column}" AS v FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" != '' ORDER BY "${column}"`;
    return (clanId: string): readonly string[] => {
        const db = getClanDb(clanId);
        const rows = db.prepare(sql).all() as DistinctRow[];
        return rows.map((r) => String(r.v));
    };
}

function pluginDistinct(table: string, column: string): EntityAttributeResolver {
    const sql = `SELECT DISTINCT "${column}" AS v FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" != '' ORDER BY "${column}"`;
    return (clanId: string): readonly string[] => {
        const set = new Set<string>();
        for (const mode of pluginModes(clanId)) {
            const db = clanPluginDb(clanId, mode);
            const rows = db.prepare(sql).all() as DistinctRow[];
            for (const r of rows) set.add(String(r.v));
        }
        return [...set].sort((a, b) => a.localeCompare(b));
    };
}

function resolverFor(spec: RegisteredEntityAttribute): EntityAttributeResolver | null {
    if (spec.sqlTable.startsWith("clan_")) return clanDistinct(spec.sqlTable, spec.sqlColumn);
    if (spec.sqlTable.startsWith("plugin_")) return pluginDistinct(spec.sqlTable, spec.sqlColumn);
    return null;
}

function normalizeType(type: string): EntityAttribute["type"] {
    if (type === "integer" || type === "number") return "integer";
    if (type === "boolean") return "boolean";
    if (type === "timestamp") return "timestamp";
    return "string";
}

function toAttribute(spec: RegisteredEntityAttribute): EntityAttribute {
    return {
        path: spec.path,
        label: spec.label,
        type: normalizeType(spec.type),
        resolver: resolverFor(spec),
    };
}

export function entityAttributes(): readonly EntityAttribute[] {
    return entityAttributeRegistry.list().map(toAttribute);
}

export function lookupEntityAttribute(path: string): EntityAttribute | null {
    const spec = entityAttributeRegistry.get(path);
    return spec ? toAttribute(spec) : null;
}
