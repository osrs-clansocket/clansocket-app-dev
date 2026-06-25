import { PLUGIN_CONFIG_FIELDS } from "../../../shared/constants/plugin-config/plugin-config-fields.js";
import type { PluginConfigState } from "./client.js";
import type { Scope, Values } from "../../../shared/constants/plugin-config/scope-constants.js";

export function seedValues(): Values {
    const out: Values = {};
    for (const f of PLUGIN_CONFIG_FIELDS) out[f.key] = f.defaultValue;
    return out;
}

function applyServerValues(seed: Values, server: Values | undefined): Values {
    const out: Values = { ...seed };
    if (server) for (const k of Object.keys(server)) out[k] = server[k]!;
    return out;
}

export function effectiveValues(scope: Scope, cfg: PluginConfigState): Values {
    const globalSeed = applyServerValues(seedValues(), cfg.global?.preset.values);
    if (scope.kind === "global") return globalSeed;
    if (scope.set.size === 1) {
        const [hash] = scope.set;
        const override = cfg.overrides.find((o) => o.accountHash === hash);
        return applyServerValues(globalSeed, override?.preset.values);
    }
    return globalSeed;
}
