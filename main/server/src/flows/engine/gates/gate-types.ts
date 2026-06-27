import type { ExecContext } from "../context/exec-context.js";
import type { FlowNode } from "../../store/flow-definition-types.js";

export type GateKind = "shape" | "trigger-filter" | "profile" | "world";

export type GateDecision = "pass" | "skip" | "fail";

export interface GateResult {
    readonly decision: GateDecision;
    readonly reason?: string;
}

export interface GateContext {
    readonly exec: ExecContext;
    readonly node?: FlowNode;
}

export interface GateSpec {
    readonly kind: GateKind;
    readonly run: (ctx: GateContext) => GateResult;
}
