import { BaseRegistry } from "../../base/base-registry.js";
import type { Renderer } from "./renderer-types.js";

const RENDERERS = new BaseRegistry<string, Renderer>();

export const rendererStore = {
    register: (triggerType: string, renderer: Renderer): void => RENDERERS.register(triggerType, renderer),
    pick: (triggerType: string): Renderer | null => RENDERERS.get(triggerType),
    listTriggers: (): readonly string[] => RENDERERS.keys(),
    clear: (): void => RENDERERS.clear(),
};

export const registerRenderer = rendererStore.register;
export const pickRenderer = rendererStore.pick;
export const listSupportedTriggers = rendererStore.listTriggers;
export const clearRenderers = rendererStore.clear;
