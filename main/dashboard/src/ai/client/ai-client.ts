import { fetchPinnedContext, unpinPinnedIds } from "./pinned-context.js";
import { sendChat } from "./send-chat.js";

export const aiClient = {
    send: sendChat,
    getPinnedContext: fetchPinnedContext,
    unpinContext: unpinPinnedIds,
} as const;
