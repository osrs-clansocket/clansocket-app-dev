import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_SERVER_STICKER } from "../route-common/target-kinds.js";
interface DeleteStickerBody {
    userId: string;
    targetName: string;
}

const router = mutationRoute({
    method: "delete",
    path: "/:guildId/:stickerId",
    targetKind: TARGET_DISCORD_SERVER_STICKER,
    opKind: "delete",
    clansocketPermission: "discord:server-stickers.delete",
    rateLimitRoute: "/guilds/:id/stickers/:sticker_id",
    auditAction: ClanAuditActions.DiscordServerStickersDelete,
    failureCode: "server_sticker_delete_failed",
    buildPayload: (req) => {
        const body = req.body as DeleteStickerBody;
        const stickerId = req.params.stickerId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: stickerId,
            after: {},
            auditPayload: { guildId, targetName: body.targetName },
        };
    },
});
registerMount("/server-stickers", router);
export default router;
