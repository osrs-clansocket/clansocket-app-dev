import { Events } from "discord.js";
import { extractRoleRow } from "../../../../state-sync/roles/extract.js";
import { registerListener } from "../../listener-registry.js";
import { pRoleCU } from "../../specs/payloads.js";
import { upsertOf } from "../../specs/persisters.js";
import { passNew } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildRoleUpdate,
    triggerId: "discord:roles.updated",
    selectEntity: passNew,
    buildPayload: pRoleCU,
    persist: upsertOf("roles", extractRoleRow),
});
