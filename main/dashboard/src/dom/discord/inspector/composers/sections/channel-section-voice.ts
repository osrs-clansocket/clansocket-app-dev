import type { Instance } from "../../../../factory";
import type { DiscordChannel } from "../../../../../state/discord/client.js";
import { buildReadonlySection } from "../../builders/section-builder.js";

export function voiceChannelSections(channel: DiscordChannel): Instance[] {
    const out: Instance[] = [];
    if (channel.bitrate !== null) {
        out.push(buildReadonlySection({ title: "Bitrate (bps)", value: String(channel.bitrate) }));
    }
    if (channel.user_limit !== null) {
        out.push(
            buildReadonlySection({
                title: "User limit",
                value: channel.user_limit === 0 ? "unlimited" : String(channel.user_limit),
            }),
        );
    }
    return out;
}
