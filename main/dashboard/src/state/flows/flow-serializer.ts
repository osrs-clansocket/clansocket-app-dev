import type {
    FlowCardConfig,
    FlowCardPlacement,
    FlowMeta,
} from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { conditionsToFilterDsl } from "./condition-dsl-bridge.js";

interface SerializedEdge {
    readonly id: string;
    readonly from_node_id: string;
    readonly from_handle_id: string;
    readonly to_node_id: string;
}

interface SerializedNode {
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

const DEFAULT_NEXT_HANDLE = { id: "next", label: "Next" };

function nodeKindFromCard(config: FlowCardConfig): string {
    if (config.kind === "trigger") return "trigger";
    if (config.kind === "action") return "action";
    if (config.kind === "condition") return "condition";
    if (config.kind === "delay") return "delay";
    return "wait-for-event";
}

function outputHandlesFor(config: FlowCardConfig): SerializedNode["output_handles"] {
    if (config.kind === "action" && config.openExits.length > 0) {
        return config.openExits.map((cls) => ({ id: cls, label: cls, result_class: cls }));
    }
    if (config.kind === "condition") {
        return [
            { id: "yes", label: "Yes" },
            { id: "no", label: "No" },
        ];
    }
    if (config.kind === "wait-for-event") {
        return [
            { id: "event", label: "Event" },
            { id: "timeout", label: "Timeout" },
        ];
    }
    return [DEFAULT_NEXT_HANDLE];
}

function configForNode(config: FlowCardConfig): Readonly<Record<string, unknown>> {
    if (config.kind === "trigger") {
        return { trigger_type: config.triggerType, conditions: conditionsToFilterDsl(config.conditions) };
    }
    if (config.kind === "action") {
        return { ...config.inputValues };
    }
    if (config.kind === "condition") {
        return { conditions: conditionsToFilterDsl(config.conditions) };
    }
    if (config.kind === "delay") {
        return { value: config.waitValue, unit: config.waitUnit };
    }
    return { event_trigger_id: config.eventTriggerId, timeout_ms: config.timeoutMs };
}

function statusForNode(config: FlowCardConfig): "live" | "manual" | undefined {
    if (config.kind !== "action") return undefined;
    return undefined;
}

function operationRefFor(config: FlowCardConfig): string | undefined {
    return config.kind === "action" && config.operationId.length > 0 ? config.operationId : undefined;
}

function serializeNode(placement: FlowCardPlacement): SerializedNode {
    const config = placement.config;
    return {
        id: config.id,
        kind: nodeKindFromCard(config),
        operation_ref: operationRefFor(config),
        config: configForNode(config),
        row: placement.row,
        col: placement.col,
        row_span: 1,
        col_span: 1,
        input_policy: "single",
        output_handles: outputHandlesFor(config),
        status: statusForNode(config),
    };
}

function placementAt(placements: readonly FlowCardPlacement[], row: number, col: number): FlowCardPlacement | null {
    return placements.find((p) => p.row === row && p.col === col) ?? null;
}

function deriveEdges(placements: readonly FlowCardPlacement[]): readonly SerializedEdge[] {
    const edges: SerializedEdge[] = [];
    for (const p of placements) {
        const handles = outputHandlesFor(p.config);
        const defaultHandle = handles[0]?.id ?? "next";
        const right = placementAt(placements, p.row, p.col + 1);
        if (right) {
            edges.push({
                id: `${p.config.id}->${right.config.id}`,
                from_node_id: p.config.id,
                from_handle_id: defaultHandle,
                to_node_id: right.config.id,
            });
        }
        const below = placementAt(placements, p.row + 1, p.col);
        if (below) {
            const handleForBelow = handles.length > 1 ? handles[1]!.id : defaultHandle;
            edges.push({
                id: `${p.config.id}>${below.config.id}`,
                from_node_id: p.config.id,
                from_handle_id: handleForBelow,
                to_node_id: below.config.id,
            });
        }
    }
    return edges;
}

function inferTriggerType(meta: FlowMeta): "event" | "manual" | "schedule" | "loop" {
    if (meta.loop) return "loop";
    if (meta.scheduleAtMs !== null) return "schedule";
    return "event";
}

function entryNodeId(placements: readonly FlowCardPlacement[]): string {
    const entry = placementAt(placements, 0, 0);
    if (entry) return entry.config.id;
    return placements[0]?.config.id ?? "";
}

function triggerConfigFor(meta: FlowMeta): Readonly<Record<string, unknown>> {
    if (meta.loop) return { loop_interval_ms: 60_000 };
    if (meta.scheduleAtMs !== null) return { schedule_cron: "" };
    const entry = placementAt(meta.placements, 0, 0);
    if (entry && entry.config.kind === "trigger") {
        return { event_source: entry.config.triggerType };
    }
    return {};
}

export function serializeFlowDefinition(meta: FlowMeta): Readonly<Record<string, unknown>> {
    return {
        trigger_type: inferTriggerType(meta),
        trigger_config: triggerConfigFor(meta),
        entry_node_id: entryNodeId(meta.placements),
        nodes: meta.placements.map(serializeNode),
        edges: deriveEdges(meta.placements),
    };
}
