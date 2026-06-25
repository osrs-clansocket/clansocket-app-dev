import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../../route-common/mutation-route.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_GUILD_SETTINGS } from "../../route-common/target-kinds.js";
interface VerifyLevelBody {
    userId: string;
    guildName: string;
    beforeLevel: number;
    level: number;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/verification-level",
    targetKind: TARGET_DISCORD_GUILD_SETTINGS,
    opKind: "update",
    clansocketPermission: "discord:guild-settings.set-verification-level",
    rateLimitRoute: "/guilds/:id",
    auditAction: ClanAuditActions.DiscordGuildSettingsSetVerificationLevel,
    failureCode: "set_verification_level_failed",
    buildPayload: (req) => {
        const body = req.body as VerifyLevelBody;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: guildId,
            before: { subject: "verification-level", level: body.beforeLevel },
            after: { subject: "verification-level", level: body.level },
            auditPayload: {
                guildId,
                targetName: body.guildName,
                beforeLevel: body.beforeLevel,
                afterLevel: body.level,
            },
        };
    },
});
registerMount("/guild-settings", router);
export default router;
