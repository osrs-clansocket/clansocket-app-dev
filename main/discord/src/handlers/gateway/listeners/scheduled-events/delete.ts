import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pScheduledEvent } from "../../specs/payloads.js";
import { persistNoop } from "../../specs/persisters-noop.js";
import { passthrough } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildScheduledEventDelete,
    selectEntity: passthrough,
    buildPayload: pScheduledEvent,
    persist: persistNoop,
});
