import { BaseRegistry } from "../../../base/base-registry.js";
import type { NodeKind } from "../../store/flow-definition-types.js";
import type { ComponentSpec } from "./component-types.js";

class ComponentRegistryStore extends BaseRegistry<NodeKind, ComponentSpec> {}

export const componentRegistry = new ComponentRegistryStore();

export function registerComponent(spec: ComponentSpec): void {
    componentRegistry.registerUnique(spec.kind, spec, (key) => new Error(`component "${key}" already registered`));
}
