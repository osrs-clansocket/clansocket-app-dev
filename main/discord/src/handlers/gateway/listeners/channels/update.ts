import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pChannel } from "../../specs/payloads.js";
import { persistChannelUpdate } from "../../specs/persisters.js";
import { channelGuardNew } from "../../specs/selectors-guards.js";

registerListener({
    event: Events.ChannelUpdate,
    selectEntity: channelGuardNew,
    buildPayload: pChannel,
    persist: persistChannelUpdate,
});
