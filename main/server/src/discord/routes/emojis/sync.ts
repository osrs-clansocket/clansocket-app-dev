import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { authenticate, handleAsync } from "../../../api/middleware.js";
import { replaceEmojisBot, type EmojiInput } from "../../../database/discord/emojis/upsert-batch.js";
import { lookupPublicPath } from "../../emojis/scan-public-paths.js";
import { flushExpandShortcodes } from "../../emojis/shortcode-expander.js";
import { HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
interface SyncBody {
    botId: string;
    botName: string | null;
    emojis: Array<{ id: string; name: string; animated: boolean }>;
}

function buildInputs(body: SyncBody): EmojiInput[] {
    return body.emojis.map((e) => ({
        botId: body.botId,
        botName: body.botName,
        emojiId: e.id,
        name: e.name,
        animated: e.animated,
        publicPath: lookupPublicPath(e.name),
    }));
}

const router = mountedRouter("/emojis");

router.post(
    "/sync",
    authenticate,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as SyncBody;
        try {
            const inputs = buildInputs(body);
            replaceEmojisBot(body.botId, inputs);
            flushExpandShortcodes();
            const matched = inputs.filter((e) => e.publicPath !== null).length;
            res.json({ ok: true, total: inputs.length, matched });
        } catch (err) {
            logger.error(`[discord] emoji sync failed for bot ${body.botId}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "emoji_sync_failed" });
        }
    }),
);

export default router;
