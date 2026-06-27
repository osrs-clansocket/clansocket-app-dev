import { evaluateFilter } from "../../../filter/evaluators/dsl-evaluator.js";
import { BaseGate } from "./base/base-gate.js";
import { registerGate } from "./gate-registry.js";
import { toFilterContext } from "../context/exec-context.js";
import type { GateContext, GateKind, GateResult } from "./gate-types.js";

class TriggerFilterGate extends BaseGate {
    public readonly kind: GateKind = "trigger-filter";

    public run(ctx: GateContext): GateResult {
        const filter = ctx.exec.definition.trigger_config.trigger_filter;
        if (!filter) return this.pass();
        const matches = evaluateFilter(filter, toFilterContext(ctx.exec));
        return matches ? this.pass() : this.skip("trigger filter rejected");
    }
}

registerGate(new TriggerFilterGate());
