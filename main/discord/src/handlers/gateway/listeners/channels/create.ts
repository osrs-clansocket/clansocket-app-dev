import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pChannel } from "../../specs/payloads.js";
import { persistChannelCreate } from "../../specs/persisters.js";
import { channelGuard } from "../../specs/selectors-guards.js";

registerListener({
    event: Events.ChannelCreate,
    selectEntity: channelGuard,
    buildPayload: pChannel,
    persist: persistChannelCreate,
});
