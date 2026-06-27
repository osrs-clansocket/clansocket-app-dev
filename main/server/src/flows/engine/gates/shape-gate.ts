import { BaseGate } from "./base/base-gate.js";
import { registerGate } from "./gate-registry.js";
import type { GateContext, GateKind, GateResult } from "./gate-types.js";

class ShapeGate extends BaseGate {
    public readonly kind: GateKind = "shape";

    public run(_ctx: GateContext): GateResult {
        return this.pass();
    }
}

registerGate(new ShapeGate());
