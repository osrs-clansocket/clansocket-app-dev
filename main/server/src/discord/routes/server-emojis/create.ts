import { randomUUID } from "node:crypto";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_SERVER_EMOJI } from "../route-common/target-kinds.js";
interface CreateEmojiBody {
    userId: string;
    name: string;
    imageDataUrl: string;
    animated: boolean;
    roleIds?: readonly string[];
}

const router = mutationRoute({
    method: "post",
    path: PATH_GUILD,
    targetKind: TARGET_DISCORD_SERVER_EMOJI,
    opKind: "create",
    clansocketPermission: "discord:server-emojis.create",
    rateLimitRoute: "/guilds/:id/emojis",
    auditAction: ClanAuditActions.DiscordServerEmojisCreate,
    failureCode: "server_emoji_create_failed",
    buildPayload: (req) => {
        const body = req.body as CreateEmojiBody;
        const guildId = req.params.guildId as string;
        const tempId = `temp:${randomUUID()}`;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: tempId,
            after: {
                name: body.name,
                imageDataUrl: body.imageDataUrl,
                roleIds: body.roleIds ?? [],
            },
            auditPayload: { guildId, targetName: body.name, animated: body.animated },
            responseExtras: { tempId },
        };
    },
});
registerMount("/server-emojis", router);
export default router;
