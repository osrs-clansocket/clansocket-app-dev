import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { updateAuditPayload } from "../route-common/audit-payloads.js";
import { mutationRoute } from "../route-common/mutation-route.js";
import { MOUNT_CHANNELS } from "../route-common/route-paths.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_CHANNEL } from "../route-common/target-kinds.js";
interface DiscordChannelState {
    name: string;
    topic?: string | null;
    nsfw?: boolean;
    rateLimitPerUser?: number;
    parentId?: string | null;
}

interface UpdateChannelBody {
    userId: string;
    before: DiscordChannelState;
    after: DiscordChannelState;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/:channelId",
    targetKind: TARGET_DISCORD_CHANNEL,
    opKind: "update",
    clansocketPermission: "discord:channels.update",
    rateLimitRoute: "/channels/:id",
    auditAction: ClanAuditActions.DiscordChannelsUpdate,
    failureCode: "update_channel_failed",
    buildPayload: (req) => {
        const body = req.body as UpdateChannelBody;
        const channelId = req.params.channelId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: channelId,
            before: body.before,
            after: body.after,
            auditPayload: updateAuditPayload(guildId, body.after.name, body.before, body.after),
        };
    },
});
registerMount(MOUNT_CHANNELS, router);
export default router;
