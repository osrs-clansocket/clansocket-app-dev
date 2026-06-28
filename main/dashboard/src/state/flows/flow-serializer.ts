import type { FlowMeta } from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { serializeNode } from "./node-serializer.js";
import { entryNodeId, inferTriggerType, triggerConfigFor } from "./trigger-serializer.js";

export function serializeFlowDefinition(meta: FlowMeta): Readonly<Record<string, unknown>> {
    return {
        trigger_type: inferTriggerType(meta),
        trigger_config: triggerConfigFor(meta),
        entry_node_id: entryNodeId(meta.placements),
        nodes: meta.placements.map(serializeNode),
        edges: meta.edges,
    };
}
