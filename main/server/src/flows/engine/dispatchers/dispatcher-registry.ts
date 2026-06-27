import { BaseRegistry } from "../../../base/base-registry.js";
import type { DispatcherSpec } from "./base/base-dispatcher.js";

class DispatcherRegistryStore extends BaseRegistry<string, DispatcherSpec> {}

export const dispatcherRegistry = new DispatcherRegistryStore();

export function registerDispatcher(spec: DispatcherSpec): void {
    dispatcherRegistry.registerUnique(spec.kind, spec, (key) => new Error(`dispatcher "${key}" already registered`));
}
