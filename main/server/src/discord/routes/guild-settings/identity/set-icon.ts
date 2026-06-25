import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../../route-common/mutation-route.js";
import { MOUNT_GUILD_SETTINGS, RATE_LIMIT_GUILD } from "../../route-common/route-paths.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_GUILD_SETTINGS } from "../../route-common/target-kinds.js";
interface SetIconBody {
    userId: string;
    guildName: string;
    beforeIconUrl: string | null;
    iconDataUrl: string | null;
    afterIconUrl: string | null;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/icon",
    targetKind: TARGET_DISCORD_GUILD_SETTINGS,
    opKind: "update",
    clansocketPermission: "discord:guild-settings.set-icon",
    rateLimitRoute: RATE_LIMIT_GUILD,
    auditAction: ClanAuditActions.DiscordGuildSettingsSetIcon,
    failureCode: "set_icon_failed",
    buildPayload: (req) => {
        const body = req.body as SetIconBody;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: guildId,
            before: { subject: "icon", iconUrl: body.beforeIconUrl },
            after: { subject: "icon", iconDataUrl: body.iconDataUrl },
            auditPayload: {
                guildId,
                targetName: body.guildName,
                beforeIconUrl: body.beforeIconUrl,
                afterIconUrl: body.afterIconUrl,
            },
        };
    },
});
registerMount(MOUNT_GUILD_SETTINGS, router);
export default router;
