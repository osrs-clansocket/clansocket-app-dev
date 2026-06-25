import type { ReorderEvent } from "../../../../../../factory";
import type { DiscordChannel } from "../../../../../../../state/discord/client.js";
import {
    CATEGORY_DRAG_KIND,
    CATEGORY_TYPE,
    CHANNEL_DRAG_KIND,
    POSITION_HALF,
    THREAD_DRAG_KIND,
    maxChildPosition,
} from "./mode-constants.js";

function invalidDropTarget(kind: string, target: DiscordChannel): boolean {
    if (kind === CATEGORY_DRAG_KIND) return true;
    if (kind === CHANNEL_DRAG_KIND && target.type !== CATEGORY_TYPE) return true;
    return kind === THREAD_DRAG_KIND;
}

export function isInvalidReorder(event: ReorderEvent, dragged: DiscordChannel, target: DiscordChannel): boolean {
    if (dragged.channel_id === target.channel_id) return true;
    if (event.position === "into" && invalidDropTarget(event.dragged.kind, target)) return true;
    return event.dragged.kind === THREAD_DRAG_KIND && target.parent_id !== dragged.parent_id;
}

export function computeNewPlacement(
    channels: readonly DiscordChannel[],
    target: DiscordChannel,
    position: ReorderEvent["position"],
): { parent_id: string | null; position: number } {
    if (position === "into") {
        return { parent_id: target.channel_id, position: maxChildPosition(channels, target.channel_id) + 1 };
    }
    const offset = position === "before" ? -POSITION_HALF : POSITION_HALF;
    return { parent_id: target.parent_id, position: (target.position ?? 0) + offset };
}
