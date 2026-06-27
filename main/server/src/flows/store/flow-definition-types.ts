import type { FilterAst } from "../../filter/dsl-types.js";

export type TriggerType = "event" | "manual" | "schedule" | "loop";
export type InputPolicy = "single" | "all-of" | "any-of";
export type NodeStatus = "draft" | "manual" | "live";

export type NodeKind =
    | "condition"
    | "trigger-split"
    | "branch"
    | "parallel"
    | "join"
    | "delay"
    | "wait-for-event"
    | "exit"
    | "variable"
    | "invariant"
    | "tracker"
    | "random-pick"
    | "cycle-pick"
    | "exhaust-pick"
    | "ui-display"
    | "action";

export interface FlowOutputHandle {
    readonly id: string;
    readonly label: string;
    readonly filter?: FilterAst;
    readonly result_class?: string;
}

export interface FlowNode {
    readonly id: string;
    readonly kind: NodeKind;
    readonly operation_ref?: string;
    readonly config: Readonly<Record<string, unknown>>;
    readonly row: number;
    readonly col: number;
    readonly row_span: number;
    readonly col_span: number;
    readonly input_policy: InputPolicy;
    readonly output_handles: readonly FlowOutputHandle[];
    readonly status?: NodeStatus;
}

export interface FlowEdge {
    readonly id: string;
    readonly from_node_id: string;
    readonly from_handle_id: string;
    readonly to_node_id: string;
}

export interface FlowTriggerConfig {
    readonly event_source?: string;
    readonly trigger_filter?: FilterAst;
    readonly schedule_cron?: string;
    readonly loop_interval_ms?: number;
}

export interface FlowDefinition {
    readonly trigger_type: TriggerType;
    readonly trigger_config: FlowTriggerConfig;
    readonly profile_filter?: FilterAst;
    readonly entry_node_id: string;
    readonly nodes: readonly FlowNode[];
    readonly edges: readonly FlowEdge[];
    readonly backpopulate_on_first_publish?: boolean;
    readonly backpopulate_lookback_ms?: number;
}

export const NODE_KINDS: readonly NodeKind[] = [
    "condition",
    "trigger-split",
    "branch",
    "parallel",
    "join",
    "delay",
    "wait-for-event",
    "exit",
    "variable",
    "invariant",
    "tracker",
    "random-pick",
    "cycle-pick",
    "exhaust-pick",
    "ui-display",
    "action",
];

export const TRIGGER_TYPES: readonly TriggerType[] = ["event", "manual", "schedule", "loop"];

export const INPUT_POLICIES: readonly InputPolicy[] = ["single", "all-of", "any-of"];

export const NODE_STATUSES: readonly NodeStatus[] = ["draft", "manual", "live"];
