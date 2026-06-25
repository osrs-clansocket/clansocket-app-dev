import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pChannel } from "../../specs/payloads.js";
import { deleteOf } from "../../specs/persisters.js";
import { channelGuard } from "../../specs/selectors-guards.js";

registerListener({
    event: Events.ChannelDelete,
    triggerId: "discord:channels.deleted",
    selectEntity: channelGuard,
    buildPayload: pChannel,
    persist: deleteOf("channels"),
});
