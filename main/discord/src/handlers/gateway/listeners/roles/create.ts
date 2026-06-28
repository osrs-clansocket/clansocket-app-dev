import { Events } from "discord.js";
import { STATE_KINDS } from "../../../../core/constants.js";
import { extractRoleRow } from "../../../../state-sync/roles/extract.js";
import { registerListener } from "../../listener-registry.js";
import { pRoleCU } from "../../specs/payloads.js";
import { upsertOf } from "../../specs/persisters.js";
import { passthrough } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildRoleCreate,
    selectEntity: passthrough,
    buildPayload: pRoleCU,
    persist: upsertOf(STATE_KINDS.ROLES, extractRoleRow),
});
