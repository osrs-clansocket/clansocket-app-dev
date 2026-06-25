import { Events } from "discord.js";
import { extractMemberRow } from "../../../../state-sync/members/extract.js";
import { registerListener } from "../../listener-registry.js";
import { pMember } from "../../specs/payloads.js";
import { upsertOf } from "../../specs/persisters.js";
import { passNew } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildMemberUpdate,
    triggerId: "discord:members.updated",
    selectEntity: passNew,
    buildPayload: pMember,
    persist: upsertOf("members", extractMemberRow),
});
