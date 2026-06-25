import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../../route-common/mutation-route.js";
import { MOUNT_GUILD_SETTINGS, RATE_LIMIT_GUILD } from "../../route-common/route-paths.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_GUILD_SETTINGS } from "../../route-common/target-kinds.js";
interface SetDescriptionBody {
    userId: string;
    guildName: string;
    beforeDescription: string | null;
    description: string | null;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/description",
    targetKind: TARGET_DISCORD_GUILD_SETTINGS,
    opKind: "update",
    clansocketPermission: "discord:guild-settings.set-description",
    rateLimitRoute: RATE_LIMIT_GUILD,
    auditAction: ClanAuditActions.DiscordGuildSettingsSetDescription,
    failureCode: "set_description_failed",
    buildPayload: (req) => {
        const body = req.body as SetDescriptionBody;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: guildId,
            before: { subject: "description", description: body.beforeDescription },
            after: { subject: "description", description: body.description },
            auditPayload: {
                guildId,
                targetName: body.guildName,
                beforeDescription: body.beforeDescription,
                afterDescription: body.description,
            },
        };
    },
});
registerMount(MOUNT_GUILD_SETTINGS, router);
export default router;
