import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pReaction } from "../../specs/payloads.js";
import { persistNoop } from "../../specs/persisters-noop.js";
import { passReaction } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.MessageReactionAdd,
    selectEntity: passReaction,
    buildPayload: pReaction,
    persist: persistNoop,
});
