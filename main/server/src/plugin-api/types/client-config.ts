export interface PluginPresetSchema {
    version: number;
    values: Record<string, string | number | boolean>;
}

export type ConfigRequestMsg = { type: "clan_config_request" };
