import { randomUUID } from "node:crypto";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_SERVER_STICKER } from "../route-common/target-kinds.js";
const FORMAT_TYPE_PNG = 1;

interface CreateStickerBody {
    userId: string;
    name: string;
    description?: string | null;
    tags?: string | null;
    imageDataUrl: string;
    formatType?: number;
}

const router = mutationRoute({
    method: "post",
    path: PATH_GUILD,
    targetKind: TARGET_DISCORD_SERVER_STICKER,
    opKind: "create",
    clansocketPermission: "discord:server-stickers.create",
    rateLimitRoute: "/guilds/:id/stickers",
    auditAction: ClanAuditActions.DiscordServerStickersCreate,
    failureCode: "server_sticker_create_failed",
    buildPayload: (req) => {
        const body = req.body as CreateStickerBody;
        const guildId = req.params.guildId as string;
        const tempId = `temp:${randomUUID()}`;
        const formatType = body.formatType ?? FORMAT_TYPE_PNG;
        const description = body.description ?? null;
        const tags = body.tags ?? null;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: tempId,
            after: {
                name: body.name,
                imageDataUrl: body.imageDataUrl,
                description,
                tags,
                formatType,
            },
            auditPayload: { targetName: body.name, guildId, formatType, description, tags },
            responseExtras: { tempId },
        };
    },
});
registerMount("/server-stickers", router);
export default router;
