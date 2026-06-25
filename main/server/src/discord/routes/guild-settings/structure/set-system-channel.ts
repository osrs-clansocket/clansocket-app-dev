import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../../route-common/mutation-route.js";
import { MOUNT_GUILD_SETTINGS, RATE_LIMIT_GUILD } from "../../route-common/route-paths.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_GUILD_SETTINGS } from "../../route-common/target-kinds.js";
interface SystemChannelBody {
    userId: string;
    guildName: string;
    beforeChannelId: string | null;
    channelId: string | null;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/system-channel",
    targetKind: TARGET_DISCORD_GUILD_SETTINGS,
    opKind: "update",
    clansocketPermission: "discord:guild-settings.set-system-channel",
    rateLimitRoute: RATE_LIMIT_GUILD,
    auditAction: ClanAuditActions.DiscordGuildSettingsSetSystemChannel,
    failureCode: "set_system_channel_failed",
    buildPayload: (req) => {
        const body = req.body as SystemChannelBody;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: guildId,
            before: { subject: "system-channel", channelId: body.beforeChannelId },
            after: { subject: "system-channel", channelId: body.channelId },
            auditPayload: {
                guildId,
                targetName: body.guildName,
                beforeChannelId: body.beforeChannelId,
                afterChannelId: body.channelId,
            },
        };
    },
});
registerMount(MOUNT_GUILD_SETTINGS, router);
export default router;
