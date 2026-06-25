import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { renameAuditPayload } from "../../route-common/audit-payloads.js";
import { mutationRoute } from "../../route-common/mutation-route.js";
import { MOUNT_GUILD_SETTINGS, RATE_LIMIT_GUILD } from "../../route-common/route-paths.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_GUILD_SETTINGS } from "../../route-common/target-kinds.js";
interface SetNameBody {
    userId: string;
    beforeName: string;
    name: string;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/name",
    targetKind: TARGET_DISCORD_GUILD_SETTINGS,
    opKind: "update",
    clansocketPermission: "discord:guild-settings.set-name",
    rateLimitRoute: RATE_LIMIT_GUILD,
    auditAction: ClanAuditActions.DiscordGuildSettingsSetName,
    failureCode: "set_name_failed",
    buildPayload: (req) => {
        const body = req.body as SetNameBody;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: guildId,
            before: { subject: "name", name: body.beforeName },
            after: { subject: "name", name: body.name },
            auditPayload: renameAuditPayload(guildId, body.name, body.beforeName, body.name),
        };
    },
});
registerMount(MOUNT_GUILD_SETTINGS, router);
export default router;
