import { Events } from "discord.js";
import { STATE_KINDS } from "../../../../core/constants.js";
import { extractMemberRow } from "../../../../state-sync/members/extract.js";
import { registerListener } from "../../listener-registry.js";
import { pMember } from "../../specs/payloads.js";
import { upsertOf } from "../../specs/persisters.js";
import { passNew } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildMemberUpdate,
    selectEntity: passNew,
    buildPayload: pMember,
    persist: upsertOf(STATE_KINDS.MEMBERS, extractMemberRow),
});
