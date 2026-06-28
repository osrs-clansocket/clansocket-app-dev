import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pVoiceState } from "../../specs/payloads.js";
import { persistNoop } from "../../specs/persisters-noop.js";
import { passVoiceState } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.VoiceStateUpdate,
    selectEntity: passVoiceState,
    buildPayload: pVoiceState,
    persist: persistNoop,
});
