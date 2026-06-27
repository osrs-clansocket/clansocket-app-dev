import type { FlowDefinition } from "../store/flow-definition-types.js";

export type ValidatorSeverity = "error" | "acknowledgement" | "warning";

export interface ValidatorFinding {
    readonly validator_id: string;
    readonly severity: ValidatorSeverity;
    readonly message: string;
    readonly node_id?: string;
    readonly edge_id?: string;
    readonly handle_id?: string;
    readonly suggestion?: string;
}

export interface ValidatorResult {
    readonly findings: readonly ValidatorFinding[];
}

export interface ValidatorContext {
    readonly definition: FlowDefinition;
}

export interface ValidatorSpec {
    readonly id: string;
    readonly run: (ctx: ValidatorContext) => ValidatorResult;
}
