import { Events } from "discord.js";
import { STATE_KINDS } from "../../../../core/constants.js";
import { extractMemberRow } from "../../../../state-sync/members/extract.js";
import { registerListener } from "../../listener-registry.js";
import { pMember } from "../../specs/payloads.js";
import { upsertOf } from "../../specs/persisters.js";
import { passthrough } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildMemberAdd,
    triggerId: "discord:members.joined",
    selectEntity: passthrough,
    buildPayload: pMember,
    persist: upsertOf(STATE_KINDS.MEMBERS, extractMemberRow),
});
