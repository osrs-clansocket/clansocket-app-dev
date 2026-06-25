import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { renameAuditPayload } from "../route-common/audit-payloads.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_SERVER_EMOJI } from "../route-common/target-kinds.js";
interface UpdateEmojiBody {
    userId: string;
    beforeName: string;
    name: string;
    roleIds?: readonly string[];
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/:emojiId",
    targetKind: TARGET_DISCORD_SERVER_EMOJI,
    opKind: "update",
    clansocketPermission: "discord:server-emojis.rename",
    rateLimitRoute: "/guilds/:id/emojis/:emoji_id",
    auditAction: ClanAuditActions.DiscordServerEmojisRename,
    failureCode: "server_emoji_update_failed",
    buildPayload: (req) => {
        const body = req.body as UpdateEmojiBody;
        const emojiId = req.params.emojiId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: emojiId,
            after: { name: body.name, roleIds: body.roleIds ?? [] },
            auditPayload: renameAuditPayload(guildId, body.name, body.beforeName, body.name),
        };
    },
});
registerMount("/server-emojis", router);
export default router;
