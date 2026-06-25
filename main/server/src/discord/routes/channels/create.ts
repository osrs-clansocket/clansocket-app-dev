import { randomUUID } from "node:crypto";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_CHANNEL } from "../route-common/target-kinds.js";
const DEFAULT_NSFW = false;
const DEFAULT_RATE_LIMIT_PER_USER = 0;

interface CreateChannelBody {
    userId: string;
    name: string;
    channelType: number;
    parentId?: string | null;
    topic?: string | null;
    nsfw?: boolean;
    rateLimitPerUser?: number;
}

const router = mutationRoute({
    method: "post",
    path: PATH_GUILD,
    targetKind: TARGET_DISCORD_CHANNEL,
    opKind: "create",
    clansocketPermission: "discord:channels.create",
    rateLimitRoute: "/guilds/:id/channels",
    auditAction: ClanAuditActions.DiscordChannelsCreate,
    failureCode: "create_channel_failed",
    buildPayload: (req) => {
        const body = req.body as CreateChannelBody;
        const guildId = req.params.guildId as string;
        const tempId = `temp:${randomUUID()}`;
        const nsfw = body.nsfw ?? DEFAULT_NSFW;
        const rateLimitPerUser = body.rateLimitPerUser ?? DEFAULT_RATE_LIMIT_PER_USER;
        const topic = body.topic ?? null;
        const parentId = body.parentId ?? null;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: tempId,
            after: { name: body.name, channelType: body.channelType, topic, nsfw, parentId, rateLimitPerUser },
            auditPayload: {
                targetName: body.name,
                channelType: body.channelType,
                guildId,
                parentId,
                topic,
                nsfw,
                rateLimitPerUser,
            },
            responseExtras: { tempId },
        };
    },
});
registerMount("/channels", router);
export default router;
