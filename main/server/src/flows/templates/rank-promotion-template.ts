import {
    edgeShape,
    flowDefinitionShape,
    nodeShape,
    outputHandleShape,
    triggerConfigShape,
} from "../store/shapers/flow-shaper.js";
import { registerTemplate } from "./template-registry.js";
import type { FlowDefinition } from "../store/flow-definition-types.js";

function build(): FlowDefinition {
    const trigger = nodeShape({
        id: "trigger",
        kind: "trigger-split",
        row: 0,
        col: 0,
        output_handles: [outputHandleShape("yes", "yes")],
    });
    const post = nodeShape({
        id: "post-promotion",
        kind: "action",
        operation_ref: "discord:channels.create",
        row: 0,
        col: 1,
        output_handles: [outputHandleShape("sent", "sent", { result_class: "sent" })],
        config: { name: "ranks", type: 0 },
    });
    const exit = nodeShape({ id: "exit", kind: "exit", row: 0, col: 2 });
    return flowDefinitionShape({
        trigger_type: "event",
        trigger_config: triggerConfigShape({ event_source: "clansocket:memberRankPromoted" }),
        entry_node_id: "trigger",
        nodes: [trigger, post, exit],
        edges: [
            edgeShape({ id: "e1", from_node_id: "trigger", from_handle_id: "yes", to_node_id: "post-promotion" }),
            edgeShape({ id: "e2", from_node_id: "post-promotion", from_handle_id: "sent", to_node_id: "exit" }),
        ],
    });
}

registerTemplate({
    id: "rank-promotion",
    name: "Rank promotion announcement",
    description: "Posts to a ranks channel when a member's clan rank is promoted.",
    group: "Members",
    build,
});
