import type { LiveSource } from "../../../dom/factory/live-ops";
import { openOverwritesStream } from "../client.js";

export interface ChannelOverwritesFeed {
    readonly source: LiveSource;
}

export function overwritesFeed(guildId: string): ChannelOverwritesFeed {
    return {
        source: {
            subscribe(onSnapshot, onDelta): () => void {
                return openOverwritesStream(guildId, onSnapshot, onDelta);
            },
        },
    };
}
