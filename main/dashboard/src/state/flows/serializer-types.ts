export interface SerializedEdge {
    readonly id: string;
    readonly from_node_id: string;
    readonly from_handle_id: string;
    readonly to_node_id: string;
}

export interface SerializedNode {
    readonly id: string;
    readonly kind: string;
    readonly operation_ref?: string;
    readonly config: Readonly<Record<string, unknown>>;
    readonly row: number;
    readonly col: number;
    readonly row_span: number;
    readonly col_span: number;
    readonly input_policy: "single" | "all-of" | "any-of";
    readonly output_handles: ReadonlyArray<{ id: string; label: string; result_class?: string }>;
    readonly status?: "draft" | "manual" | "live";
}

export const SCHEDULE_TRIGGER_VALUE = "__schedule__";
export const LOOP_TRIGGER_VALUE = "__loop__";
export const MANUAL_TRIGGER_VALUE = "__manual__";
