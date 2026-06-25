import type { LiveSource } from "../../../dom/factory/live-ops";
import { openStickersStream } from "../client.js";

export interface ServerStickersFeed {
    readonly source: LiveSource;
}

export function stickersFeed(guildId: string): ServerStickersFeed {
    return {
        source: {
            subscribe(onSnapshot, onDelta): () => void {
                return openStickersStream(guildId, onSnapshot, onDelta);
            },
        },
    };
}
