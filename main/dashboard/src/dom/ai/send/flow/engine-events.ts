import { addChainEvent } from "../../chain-events";
import type { ChainEvent } from "../storage";
import { consumeQueuedDelivery } from "./queue.js";
import type { SendElements } from "./types.js";

export function makeEventHandler(
    els: SendElements,
    events: ChainEvent[],
): (type: string, payload: Record<string, unknown>) => void {
    return (type, payload) => {
        if (type === "append" && consumeQueuedDelivery(els)) {
            events.push({ type, payload });
            return;
        }
        addChainEvent(els.messagesEl, type, payload);
        events.push({ type, payload });
    };
}
