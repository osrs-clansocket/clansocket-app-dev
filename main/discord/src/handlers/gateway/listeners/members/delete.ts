import { Events } from "discord.js";
import { STATE_KINDS } from "../../../../core/constants.js";
import { registerListener } from "../../listener-registry.js";
import { pMember } from "../../specs/payloads.js";
import { deleteOf } from "../../specs/persisters.js";
import { passthrough } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildMemberRemove,
    triggerId: "discord:members.left",
    selectEntity: passthrough,
    buildPayload: pMember,
    persist: deleteOf(STATE_KINDS.MEMBERS),
});
