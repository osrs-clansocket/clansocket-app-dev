import type { Instance } from "../../../../factory";
import type { DiscordChannel } from "../../../../../state/discord/client.js";
import { pairedChannel, buildReadonlySection } from "../../builders/section-builder.js";
import { buildPinsSection } from "./channel-pins-section.js";
import { baseSections, isThreadChannel } from "./channel-section-base.js";
import { textChannelSections } from "./channel-section-text.js";
import { voiceChannelSections } from "./channel-section-voice.js";
import { threadChannelSections } from "./channel-section-thread.js";

const CHANNEL_TYPE_VOICE = 2;
const CHANNEL_TYPE_CATEGORY = 4;
const CHANNEL_TYPE_STAGE = 13;

export function channelSections(channel: DiscordChannel): Instance[] {
    const isCategory = channel.type === CHANNEL_TYPE_CATEGORY;
    const isVoiceOrStage = channel.type === CHANNEL_TYPE_VOICE || channel.type === CHANNEL_TYPE_STAGE;
    const isThread = isThreadChannel(channel.type);
    const out: Instance[] = baseSections(channel);
    if (!isCategory) out.push(...pairedChannel("Parent", channel.guild_id, channel.parent_id));
    if (!isCategory && !isVoiceOrStage) out.push(...textChannelSections(channel));
    if (channel.rate_limit_per_user !== null) {
        out.push(buildReadonlySection({ title: "Slowmode (seconds)", value: String(channel.rate_limit_per_user) }));
    }
    if (isVoiceOrStage) out.push(...voiceChannelSections(channel));
    if (!isCategory && !isThread) out.push(buildPinsSection(channel));
    if (isThread) out.push(...threadChannelSections(channel));
    return out;
}
