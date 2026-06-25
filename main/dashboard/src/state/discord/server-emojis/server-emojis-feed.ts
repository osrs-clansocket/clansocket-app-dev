import type { LiveSource } from "../../../dom/factory/live-ops";
import { openEmojisStream } from "../client.js";

export interface ServerEmojisFeed {
    readonly source: LiveSource;
}

export function emojisFeed(guildId: string): ServerEmojisFeed {
    return {
        source: {
            subscribe(onSnapshot, onDelta): () => void {
                return openEmojisStream(guildId, onSnapshot, onDelta);
            },
        },
    };
}
