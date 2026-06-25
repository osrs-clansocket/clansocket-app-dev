import { BaseRegistry } from "../base/base-registry.js";

export interface BasePlugin {
    readonly name: string;
    readonly type: string;
    readonly permission?: bigint | null;
    filter?(event: any): boolean;
    execute(...args: any[]): Promise<unknown>;
    handleError?(event: any, error: unknown): Promise<void>;
    data?: unknown;
}

class PluginRegistry extends BaseRegistry<string, BasePlugin> {
    async load(): Promise<void> {
        return;
    }
}

export const slashRegistry = new PluginRegistry();
export const interactionRegistry = new PluginRegistry();
export const messageRegistry = new PluginRegistry();
export const commandRegistry = new PluginRegistry();
