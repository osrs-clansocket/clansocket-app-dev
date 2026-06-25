import { PLUGIN_CONFIG_FIELDS_PROGRESS } from "./plugin-config-progress.js";
import { PLUGIN_CONFIG_FIELDS_RUNTIME } from "./plugin-config-runtime.js";
import type { PluginConfigField } from "./plugin-config-types.js";
export type { FieldKind, PluginConfigField } from "./plugin-config-types.js";

export const PLUGIN_CONFIG_FIELDS: readonly PluginConfigField[] = [
    ...PLUGIN_CONFIG_FIELDS_RUNTIME,
    ...PLUGIN_CONFIG_FIELDS_PROGRESS,
];
