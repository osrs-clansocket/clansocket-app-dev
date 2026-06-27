import {
    edgeShape,
    flowDefinitionShape,
    nodeShape,
    outputHandleShape,
    triggerConfigShape,
} from "../store/shapers/flow-shaper.js";
import { registerTemplate } from "./template-registry.js";
import type { FlowDefinition } from "../store/flow-definition-types.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function build(): FlowDefinition {
    const post = nodeShape({
        id: "post-newsletter",
        kind: "action",
        operation_ref: "discord:channels.create",
        row: 0,
        col: 0,
        output_handles: [outputHandleShape("sent", "sent", { result_class: "sent" })],
        config: { name: "newsletter", type: 0 },
    });
    const exit = nodeShape({ id: "exit", kind: "exit", row: 0, col: 1 });
    return flowDefinitionShape({
        trigger_type: "loop",
        trigger_config: triggerConfigShape({ loop_interval_ms: WEEK_MS }),
        entry_node_id: "post-newsletter",
        nodes: [post, exit],
        edges: [edgeShape({ id: "e1", from_node_id: "post-newsletter", from_handle_id: "sent", to_node_id: "exit" })],
    });
}

registerTemplate({
    id: "weekly-newsletter",
    name: "Weekly clan newsletter",
    description: "Posts a weekly newsletter digest to a #newsletter channel.",
    group: "Recurring",
    build,
});
