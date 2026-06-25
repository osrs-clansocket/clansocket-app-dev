import logger from "@clansocket/logger";
import { handleAsync } from "../../../api/middleware.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";
import { validateDiscordBot } from "../../byo-bot/validators/payload-validator.js";
import { verifyCreds } from "../../byo-bot/verifiers/token-verifier.js";
import { withClan } from "../route-common/preflight.js";
import { MOUNT_BYO_BOT } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter(MOUNT_BYO_BOT);

router.post(
    "/:slug/verify",
    handleAsync(
        withClan(async (ctx, req, res) => {
            const { clan } = ctx;
            try {
                const payload = req.body as unknown;
                if (!validateDiscordBot(payload)) {
                    res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: "invalid_payload" });
                    return;
                }
                const result = await verifyCreds(payload);
                if (result.status !== "ok") {
                    res.json({ ok: false, reason: result.status });
                    return;
                }
                res.json({ ok: true, public_metadata: result.public_metadata });
            } catch (err) {
                logger.error(`[discord-byo] verify failed slug=${clan.slug}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "verify_failed" });
            }
        }),
    ),
);

export default router;
