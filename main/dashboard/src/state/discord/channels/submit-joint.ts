import type { ToolbarOpts } from "../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-constants.js";
import { submitChannelCreate, submitWebhookCreate } from "./create-dropdown/create-dropdown-creators.js";
import { awaitWebhookChannel } from "./dropdown-await-channel.js";

export interface SubmitJointArgs {
    opts: ToolbarOpts;
    typeValue: number;
    parentId: string | null;
    channelName: string;
    webhookName: string;
}

export async function submitJoint(args: SubmitJointArgs): Promise<string | undefined> {
    const { opts, typeValue, parentId, channelName, webhookName } = args;
    const beforeIds = new Set(opts.getChannels().map((c) => c.channel_id));
    const channelOk = await submitChannelCreate(opts.guildId, typeValue, parentId, channelName);
    if (!channelOk) return "Failed to create channel.";
    const newChannel = await awaitWebhookChannel(opts.getChannels, beforeIds);
    if (newChannel === null) return "Channel created — webhook timed out waiting for the new channel.";
    const webhookOk = await submitWebhookCreate(opts.guildId, newChannel.channel_id, webhookName);
    if (!webhookOk) return "Channel created — webhook creation failed.";
    return undefined;
}
