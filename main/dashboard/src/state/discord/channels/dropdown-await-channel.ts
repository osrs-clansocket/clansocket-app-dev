import type { DiscordChannel } from "../client.js";
import {
    JOINT_POLL_INTERVAL_MS,
    JOINT_WAIT_TIMEOUT_MS,
    isWebhookCapable,
} from "../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-constants.js";

export function awaitWebhookChannel(
    getChannels: () => readonly DiscordChannel[],
    beforeIds: ReadonlySet<string>,
): Promise<DiscordChannel | null> {
    return new Promise((resolve) => {
        const startedAt = Date.now();
        const tick = (): void => {
            const candidate = getChannels().find((c) => !beforeIds.has(c.channel_id) && isWebhookCapable(c.type));
            if (candidate !== undefined) {
                resolve(candidate);
                return;
            }
            if (Date.now() - startedAt > JOINT_WAIT_TIMEOUT_MS) {
                resolve(null);
                return;
            }
            setTimeout(tick, JOINT_POLL_INTERVAL_MS);
        };
        tick();
    });
}
