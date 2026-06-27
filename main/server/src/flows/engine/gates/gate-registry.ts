import { BaseRegistry } from "../../../base/base-registry.js";
import type { GateKind, GateSpec } from "./gate-types.js";

class GateRegistryStore extends BaseRegistry<GateKind, GateSpec> {}

export const gateRegistry = new GateRegistryStore();

export function registerGate(spec: GateSpec): void {
    gateRegistry.registerUnique(spec.kind, spec, (key) => new Error(`gate "${key}" already registered`));
}
