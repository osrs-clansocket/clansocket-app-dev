import type { LiveSource } from "../../../dom/factory/live-ops";
import { openSettingsStream } from "../client.js";

export interface GuildSettingsFeed {
    readonly source: LiveSource;
}

export function settingsFeed(guildId: string): GuildSettingsFeed {
    return {
        source: {
            subscribe(onSnapshot, onDelta): () => void {
                return openSettingsStream(guildId, onSnapshot, onDelta);
            },
        },
    };
}
