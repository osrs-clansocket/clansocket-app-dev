import { Events } from "discord.js";
import { STATE_KINDS } from "../../../../core/constants.js";
import { registerListener } from "../../listener-registry.js";
import { pRoleDelete } from "../../specs/payloads.js";
import { deleteOf } from "../../specs/persisters.js";
import { passthrough } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildRoleDelete,
    selectEntity: passthrough,
    buildPayload: pRoleDelete,
    persist: deleteOf(STATE_KINDS.ROLES),
});
