import { lookupEntityAttribute } from "../registries/entity-attribute-schema.js";
import { conditionValueOptions } from "../../database/discord/auto-hook-conditions/value-options.js";
import { lookupTrigger } from "../registries/capability-registry.js";

export type ValueOptionsScope = "trigger" | "entity" | "event";

export function resolveValueOptions(
    scope: ValueOptionsScope,
    clanId: string,
    field: string,
    triggerType: string | null,
): readonly string[] {
    if (scope === "entity") {
        const attr = lookupEntityAttribute(field);
        if (!attr || !attr.resolver) return [];
        return attr.resolver(clanId);
    }
    if (scope === "trigger") {
        if (!triggerType) return [];
        return conditionValueOptions(clanId, triggerType, field);
    }
    if (scope === "event") {
        if (!triggerType) return [];
        const trigger = lookupTrigger(triggerType);
        if (!trigger) return [];
        const props = trigger.payload_schema.properties as Readonly<Record<string, unknown>> | undefined;
        if (!props) return [];
        return field in props ? [] : [];
    }
    return [];
}
