import { BTN_VARIANT_BARE, button, span, type Instance } from "../../factory";
import type { MemoryFile } from "../../../ai/memory-client";
import {
    AI_MEMORY_LIST_ID_CLASS,
    AI_MEMORY_LIST_ITEM_CLASS,
    AI_MEMORY_LIST_TYPE_CLASS,
} from "../../../shared/constants/ai-memory-constants.js";

export function buildListItem(file: MemoryFile): Instance<HTMLButtonElement> {
    return button(
        {
            classes: [AI_MEMORY_LIST_ITEM_CLASS],
            variant: BTN_VARIANT_BARE,
            data: { id: file.id },
            context: "open this memory file",
            meta: ["action"],
        },
        [
            span({ classes: [AI_MEMORY_LIST_ID_CLASS], text: file.id, context: null, meta: null }),
            span({ classes: [AI_MEMORY_LIST_TYPE_CLASS], text: file.type, context: null, meta: null }),
        ],
    );
}
