import { div, heading, pre, type Instance, baseProps, textProps } from "../../factory";
import type { Payload } from "./summaries";
import {
    AI_BAR_EVENT_CODE_CLASS,
    AI_BAR_PIN_ITEM_CLASS,
    AI_BAR_PIN_ITEM_ID_CLASS,
    AI_BAR_PIN_LIST_CLASS,
} from "../../../shared/constants/ai-bar-constants.js";
import { eventDetails } from "./event-details.js";

type PinItem = { id: string; content: string };

function isPinItems(items: unknown): items is PinItem[] {
    return Array.isArray(items) && items.every((i) => i && typeof (i as PinItem).id === "string");
}

function pinItem(item: PinItem): Instance {
    return div(baseProps([AI_BAR_PIN_ITEM_CLASS]), [
        heading("h4", { classes: [AI_BAR_PIN_ITEM_ID_CLASS], text: item.id, context: null, meta: null }),
        pre(textProps([AI_BAR_EVENT_CODE_CLASS], item.content || "(empty)")),
    ]);
}

function pinListBody(items: PinItem[]): Instance {
    return div(baseProps([AI_BAR_PIN_LIST_CLASS]), items.map(pinItem));
}

export function buildPinBody(p: Payload): Instance | null {
    const items = p.items;
    if (!isPinItems(items) || items.length === 0) return null;
    return eventDetails(() => pinListBody(items), "expand the event payload");
}
