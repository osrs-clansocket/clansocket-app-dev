import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pMessage } from "../../specs/payloads.js";
import { persistNoop } from "../../specs/persisters-noop.js";
import { passNew } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.MessageUpdate,
    selectEntity: passNew,
    buildPayload: pMessage,
    persist: persistNoop,
});
