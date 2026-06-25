import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_CHANNEL } from "../route-common/target-kinds.js";
interface DeleteChannelBody {
    userId: string;
    channelName: string;
    channelType: number;
}

const router = mutationRoute({
    method: "delete",
    path: "/:guildId/:channelId",
    targetKind: TARGET_DISCORD_CHANNEL,
    opKind: "delete",
    clansocketPermission: "discord:channels.delete",
    rateLimitRoute: "/channels/:id",
    auditAction: ClanAuditActions.DiscordChannelsDelete,
    failureCode: "delete_channel_failed",
    buildPayload: (req) => {
        const body = req.body as DeleteChannelBody;
        const channelId = req.params.channelId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: channelId,
            before: { name: body.channelName, channelType: body.channelType },
            auditPayload: { guildId, targetName: body.channelName, channelType: body.channelType },
        };
    },
});
registerMount("/channels", router);
export default router;
