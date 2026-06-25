import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_SERVER_EMOJI } from "../route-common/target-kinds.js";
interface DeleteEmojiBody {
    userId: string;
    targetName: string;
}

const router = mutationRoute({
    method: "delete",
    path: "/:guildId/:emojiId",
    targetKind: TARGET_DISCORD_SERVER_EMOJI,
    opKind: "delete",
    clansocketPermission: "discord:server-emojis.delete",
    rateLimitRoute: "/guilds/:id/emojis/:emoji_id",
    auditAction: ClanAuditActions.DiscordServerEmojisDelete,
    failureCode: "server_emoji_delete_failed",
    buildPayload: (req) => {
        const body = req.body as DeleteEmojiBody;
        const emojiId = req.params.emojiId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: emojiId,
            after: {},
            auditPayload: { guildId, targetName: body.targetName },
        };
    },
});
registerMount("/server-emojis", router);
export default router;
