import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pScheduledEvent } from "../../specs/payloads.js";
import { persistNoop } from "../../specs/persisters-noop.js";
import { passNew } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildScheduledEventUpdate,
    selectEntity: passNew,
    buildPayload: pScheduledEvent,
    persist: persistNoop,
});
