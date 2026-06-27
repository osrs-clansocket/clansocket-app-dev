import {
    edgeShape,
    flowDefinitionShape,
    nodeShape,
    outputHandleShape,
    triggerConfigShape,
} from "../store/shapers/flow-shaper.js";
import type { FlowDefinition } from "../store/flow-definition-types.js";

export function verticalSliceFixture(): FlowDefinition {
    const triggerNode = nodeShape({
        id: "trigger",
        kind: "trigger-split",
        row: 0,
        col: 0,
        output_handles: [outputHandleShape("yes", "yes")],
    });
    const conditionNode = nodeShape({
        id: "rank-check",
        kind: "condition",
        row: 0,
        col: 1,
        output_handles: [
            outputHandleShape("yes", "yes"),
            outputHandleShape("no", "no"),
        ],
    });
    const actionNode = nodeShape({
        id: "create-channel",
        kind: "action",
        operation_ref: "discord:channels.create",
        config: { guildId: "FIXTURE_GUILD", name: "general-spawned", type: 0 },
        row: 0,
        col: 2,
        output_handles: [outputHandleShape("sent", "sent", { result_class: "sent" })],
    });
    const exitSent = nodeShape({
        id: "exit-sent",
        kind: "exit",
        row: 0,
        col: 3,
        config: { reason: "completed" },
    });
    const exitSkip = nodeShape({
        id: "exit-skip",
        kind: "exit",
        row: 1,
        col: 1,
        config: { reason: "wrong-rank" },
    });
    return flowDefinitionShape({
        trigger_type: "event",
        trigger_config: triggerConfigShape({ event_source: "discord:channels.created" }),
        entry_node_id: "trigger",
        nodes: [triggerNode, conditionNode, actionNode, exitSent, exitSkip],
        edges: [
            edgeShape({ id: "e1", from_node_id: "trigger", from_handle_id: "yes", to_node_id: "rank-check" }),
            edgeShape({ id: "e2", from_node_id: "rank-check", from_handle_id: "yes", to_node_id: "create-channel" }),
            edgeShape({ id: "e3", from_node_id: "rank-check", from_handle_id: "no", to_node_id: "exit-skip" }),
            edgeShape({ id: "e4", from_node_id: "create-channel", from_handle_id: "sent", to_node_id: "exit-sent" }),
        ],
    });
}
