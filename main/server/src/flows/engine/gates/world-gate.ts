import { lookupOperation } from "../../registries/capability-registry.js";
import { BaseGate } from "./base/base-gate.js";
import { registerGate } from "./gate-registry.js";
import type { GateContext, GateKind, GateResult } from "./gate-types.js";

class WorldGate extends BaseGate {
    public readonly kind: GateKind = "world";

    public run(ctx: GateContext): GateResult {
        const node = ctx.node;
        if (!node || node.kind !== "action" || !node.operation_ref) return this.pass();
        const opSpec = lookupOperation(node.operation_ref);
        if (!opSpec) return this.fail(`unknown operation "${node.operation_ref}"`);
        return this.pass();
    }
}

registerGate(new WorldGate());
