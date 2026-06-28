import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pThread } from "../../specs/payloads.js";
import { persistNoop } from "../../specs/persisters-noop.js";
import { passNew } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.ThreadUpdate,
    selectEntity: passNew,
    buildPayload: pThread,
    persist: persistNoop,
});
