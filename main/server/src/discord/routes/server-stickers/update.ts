import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { renameAuditPayload } from "../route-common/audit-payloads.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_SERVER_STICKER } from "../route-common/target-kinds.js";
interface UpdateStickerBody {
    userId: string;
    beforeName: string;
    name: string;
    description?: string | null;
    tags?: string | null;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/:stickerId",
    targetKind: TARGET_DISCORD_SERVER_STICKER,
    opKind: "update",
    clansocketPermission: "discord:server-stickers.rename",
    rateLimitRoute: "/guilds/:id/stickers/:sticker_id",
    auditAction: ClanAuditActions.DiscordServerStickersRename,
    failureCode: "server_sticker_update_failed",
    buildPayload: (req) => {
        const body = req.body as UpdateStickerBody;
        const stickerId = req.params.stickerId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: stickerId,
            after: { name: body.name, description: body.description ?? null, tags: body.tags ?? null },
            auditPayload: renameAuditPayload(guildId, body.name, body.beforeName, body.name),
        };
    },
});
registerMount("/server-stickers", router);
export default router;
