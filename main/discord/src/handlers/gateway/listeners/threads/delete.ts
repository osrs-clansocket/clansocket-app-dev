import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pThread } from "../../specs/payloads.js";
import { persistNoop } from "../../specs/persisters-noop.js";
import { passthrough } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.ThreadDelete,
    selectEntity: passthrough,
    buildPayload: pThread,
    persist: persistNoop,
});
