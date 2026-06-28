import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { resolveValueOptions } from "../../../flows/value-resolvers/entity-value-options.js";
import { serverByGuild } from "../../../database/discord/resolve-server.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/auto-hook-conditions/value-options");

interface OptionsGate {
    server: NonNullable<ReturnType<typeof serverByGuild>>;
    triggerType: string;
    field: string;
}

function gateOptions(req: Request, res: Response, guildId: string): OptionsGate | null {
    const triggerType = typeof req.query.trigger_type === "string"
        ? req.query.trigger_type
        : typeof req.query.trigger === "string"
            ? req.query.trigger
            : "";
    const field = typeof req.query.field === "string" ? req.query.field : "";
    if (triggerType.length === 0 || field.length === 0) {
        res.status(HTTP_BAD_REQUEST).json({ error: "missing_params" });
        return null;
    }
    const server = serverByGuild(guildId);
    if (!server) {
        res.status(HTTP_BAD_REQUEST).json({ error: "guild_not_bound" });
        return null;
    }
    return { server, triggerType, field };
}

(() => {
    router.get(
        "/:guildId",
        validateGuildId,
        handleAsync(async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const gate = gateOptions(req, res, guildId);
            if (!gate) return;
            try {
                const values = await resolveValueOptions("trigger", gate.server.clan_id, gate.field, gate.triggerType);
                res.status(HTTP_OK).json({ values });
            } catch (err) {
                logger.error(
                    `[discord] condition value-options failed (${gate.triggerType}.${gate.field}): ${(err as Error).message}`,
                );
                res.status(HTTP_INTERNAL_ERROR).json({ error: "value_options_failed" });
            }
        }),
    );
})();

export default router;
