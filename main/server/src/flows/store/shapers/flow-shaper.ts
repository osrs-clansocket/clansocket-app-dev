import type {
    FlowDefinition,
    FlowEdge,
    FlowNode,
    FlowOutputHandle,
    FlowTriggerConfig,
    InputPolicy,
    NodeKind,
    TriggerType,
} from "../flow-definition-types.js";

export function outputHandleShape(
    id: string,
    label: string,
    extras: { filter?: FlowOutputHandle["filter"]; result_class?: string } = {},
): FlowOutputHandle {
    return { id, label, ...extras };
}

export function nodeShape(args: {
    id: string;
    kind: NodeKind;
    row: number;
    col: number;
    operation_ref?: string;
    config?: Readonly<Record<string, unknown>>;
    row_span?: number;
    col_span?: number;
    input_policy?: InputPolicy;
    output_handles?: readonly FlowOutputHandle[];
}): FlowNode {
    return {
        id: args.id,
        kind: args.kind,
        operation_ref: args.operation_ref,
        config: args.config ?? {},
        row: args.row,
        col: args.col,
        row_span: args.row_span ?? 1,
        col_span: args.col_span ?? 1,
        input_policy: args.input_policy ?? "single",
        output_handles: args.output_handles ?? [],
    };
}

export function edgeShape(args: {
    id: string;
    from_node_id: string;
    from_handle_id: string;
    to_node_id: string;
}): FlowEdge {
    return args;
}

export function triggerConfigShape(args: {
    event_source?: string;
    trigger_filter?: FlowTriggerConfig["trigger_filter"];
    schedule_cron?: string;
    loop_interval_ms?: number;
}): FlowTriggerConfig {
    return args;
}

export function flowDefinitionShape(args: {
    trigger_type: TriggerType;
    trigger_config: FlowTriggerConfig;
    entry_node_id: string;
    nodes: readonly FlowNode[];
    edges: readonly FlowEdge[];
    profile_filter?: FlowDefinition["profile_filter"];
}): FlowDefinition {
    return args;
}
