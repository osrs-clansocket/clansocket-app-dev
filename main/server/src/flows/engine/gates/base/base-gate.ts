import type { GateContext, GateKind, GateResult, GateSpec } from "../gate-types.js";

export abstract class BaseGate implements GateSpec {
    public abstract readonly kind: GateKind;

    public abstract run(ctx: GateContext): GateResult;

    protected pass(): GateResult {
        return { decision: "pass" };
    }

    protected skip(reason: string): GateResult {
        return { decision: "skip", reason };
    }

    protected fail(reason: string): GateResult {
        return { decision: "fail", reason };
    }
}
