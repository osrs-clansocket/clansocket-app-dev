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
    const rarityCheck = nodeShape({
        id: "rarity-check",
        kind: "condition",
        row: 0,
        col: 1,
        output_handles: [outputHandleShape("yes", "yes"), outputHandleShape("no", "no")],
    });
    const post = nodeShape({
        id: "post-drop",
        kind: "action",
        operation_ref: "discord:channels.create",
        row: 0,
        col: 2,
        output_handles: [outputHandleShape("sent", "sent", { result_class: "sent" })],
        config: { name: "drops", type: 0 },
    });
    const exit = nodeShape({
        id: "exit-sent",
        kind: "exit",
        row: 0,
        col: 3,
    });
    const skipExit = nodeShape({ id: "exit-skip", kind: "exit", row: 1, col: 1 });
    return flowDefinitionShape({
        trigger_type: "event",
        trigger_config: triggerConfigShape({ event_source: "plugin:dropObtained" }),
        entry_node_id: "trigger",
        nodes: [trigger, rarityCheck, post, exit, skipExit],
        edges: [
            edgeShape({ id: "e1", from_node_id: "trigger", from_handle_id: "yes", to_node_id: "rarity-check" }),
            edgeShape({ id: "e2", from_node_id: "rarity-check", from_handle_id: "yes", to_node_id: "post-drop" }),
            edgeShape({ id: "e3", from_node_id: "rarity-check", from_handle_id: "no", to_node_id: "exit-skip" }),
            edgeShape({ id: "e4", from_node_id: "post-drop", from_handle_id: "sent", to_node_id: "exit-sent" }),
        ],
    });
}

registerTemplate({
    id: "rare-drop",
    name: "Rare drop announcement",
    description: "Posts to a drops channel when a member receives a rare drop above value/rarity threshold.",
    group: "Drops",
    build,
});
