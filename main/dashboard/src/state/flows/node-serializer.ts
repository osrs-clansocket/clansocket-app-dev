import type {
    FlowCardConfig,
    FlowCardPlacement,
} from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { conditionsToFilterDsl } from "./condition-dsl-bridge.js";
import { outputHandlesFor } from "./node-handles.js";
import type { SerializedNode } from "./serializer-types.js";

function configForNode(config: FlowCardConfig): Readonly<Record<string, unknown>> {
    if (config.kind === "trigger") {
        return { trigger_type: config.triggerType, conditions: conditionsToFilterDsl(config.conditions) };
    }
    if (config.kind === "action") return { ...config.inputValues };
    if (config.kind === "condition") return { conditions: conditionsToFilterDsl(config.conditions) };
    if (config.kind === "delay") return { value: config.waitValue, unit: config.waitUnit };
    return { event_trigger_id: config.eventTriggerId, timeout_ms: config.timeoutMs };
}

function operationRefFor(config: FlowCardConfig): string | undefined {
    return config.kind === "action" && config.operationId.length > 0 ? config.operationId : undefined;
}

export function serializeNode(placement: FlowCardPlacement): SerializedNode {
    const config = placement.config;
    return {
        id: config.id,
        kind: config.kind,
        operation_ref: operationRefFor(config),
        config: configForNode(config),
        row: placement.row,
        col: placement.col,
        row_span: 1,
        col_span: 1,
        input_policy: "single",
        output_handles: outputHandlesFor(config),
    };
}
