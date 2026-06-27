export interface DryRunStep {
    readonly node_id: string;
    readonly node_kind: string;
    readonly decision: "would-fire" | "would-skip" | "would-pause" | "would-exit" | "would-fail" | "would-complete";
    readonly reason?: string;
    readonly resolved_config?: Readonly<Record<string, unknown>>;
}

export interface DryRunTrace {
    readonly flow_id: string;
    readonly flow_version: number;
    readonly steps: readonly DryRunStep[];
    readonly outcome: "completed" | "exited" | "failed";
    readonly final_node_id: string | null;
}
