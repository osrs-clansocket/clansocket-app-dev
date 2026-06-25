import type { Instance } from "../../../../factory";
import type { DiscordChannel } from "../../../../../state/discord/client.js";
import { editCheck, editText } from "../../builders/section-builder.js";
import { saveChannelPatch } from "./channel-section-save.js";

export function textChannelSections(channel: DiscordChannel): Instance[] {
    return [
        editText(
            "Topic",
            channel.topic ?? "",
            (next) => void saveChannelPatch(channel, { topic: next.length > 0 ? next : null }),
        ),
        editCheck("NSFW", channel.nsfw, (next) => void saveChannelPatch(channel, { nsfw: next })),
    ];
}
