import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pRoleDelete } from "../../specs/payloads.js";
import { deleteOf } from "../../specs/persisters.js";
import { passthrough } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildRoleDelete,
    triggerId: "discord:roles.deleted",
    selectEntity: passthrough,
    buildPayload: pRoleDelete,
    persist: deleteOf("roles"),
});
