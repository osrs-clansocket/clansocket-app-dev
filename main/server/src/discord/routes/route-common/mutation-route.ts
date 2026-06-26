import logger from "@clansocket/logger";
import { Router, type Request, type Response } from "express";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import type { ClanAuditAction } from "../../../database/clans/audit/clan-audit-actions.js";
import { recordClanAudit } from "../../../database/clans/audit/clan-audit/record.js";
import { enqueueDraftChange } from "../../../database/discord/drafts/enqueue-change.js";
import { openDraftSession } from "../../../database/discord/drafts/open-session.js";
import { publishSingleOp } from "../../../database/discord/publish-queue/publish-single.js";
import { serverByGuild } from "../../../database/discord/resolve-server.js";
import { validateOperation } from "../../../database/discord/validators/validate-operation.js";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN, HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { ERR_GUILD_NOT_BOUND } from "./route-errors.js";

export interface MutationBuiltPayload {
    actorUserId: string;
    targetIdOrTemp: string;
    auditPayload: object;
    after?: object;
    before?: object;
    responseExtras?: object;
}

export type MutationMethod = "post" | "put" | "patch" | "delete";

export interface MutationRouteSpec {
    method: MutationMethod;
    path: string;
    targetKind: string;
    opKind: "create" | "update" | "delete";
    clansocketPermission: string;
    rateLimitRoute: string;
    auditAction: ClanAuditAction;
    failureCode: string;
    buildPayload: (req: Request) => MutationBuiltPayload;
}

interface ResolvedServer {
    bot_id: string;
    clan_id: string;
}

function runValidation(spec: MutationRouteSpec, server: ResolvedServer, guildId: string, actorUserId: string) {
    return validateOperation(
        { requiredClansocketPermission: spec.clansocketPermission, rateLimitRoute: spec.rateLimitRoute },
        { guildId, botId: server.bot_id, clanId: server.clan_id, userId: actorUserId },
    );
}

interface QueueDraftArgs {
    spec: MutationRouteSpec;
    server: ResolvedServer;
    guildId: string;
    sessionId: string;
    built: MutationBuiltPayload;
}

function queueDraftChange(a: QueueDraftArgs): string {
    const afterJson = a.built.after === undefined ? undefined : JSON.stringify(a.built.after);
    const beforeJson = a.built.before === undefined ? undefined : JSON.stringify(a.built.before);
    return enqueueDraftChange({
        afterJson,
        beforeJson,
        clanId: a.server.clan_id,
        opKind: a.spec.opKind,
        targetKind: a.spec.targetKind,
        targetIdOrTemp: a.built.targetIdOrTemp,
        guildId: a.guildId,
        sessionId: a.sessionId,
    });
}

function performMutation(
    spec: MutationRouteSpec,
    server: ResolvedServer,
    guildId: string,
    built: MutationBuiltPayload,
): { sessionId: string; changeId: string; queueId: string } {
    const sessionId = openDraftSession({ clanId: server.clan_id, ownerSiteAccountId: built.actorUserId, guildId });
    const changeId = queueDraftChange({ spec, server, guildId, sessionId, built });
    const queueId = publishSingleOp({ clanId: server.clan_id, guildId, sessionId });
    recordClanAudit(server.clan_id, {
        actor: built.actorUserId,
        action: spec.auditAction,
        targetId: built.targetIdOrTemp,
        payload: built.auditPayload,
        guildId,
    });
    return { sessionId, changeId, queueId };
}

interface MutationGate {
    server: ResolvedServer;
    built: MutationBuiltPayload;
}

function gateMutation(req: Request, res: Response, spec: MutationRouteSpec, guildId: string): MutationGate | null {
    const server = serverByGuild(guildId);
    if (!server) {
        res.status(HTTP_BAD_REQUEST).json({ error: ERR_GUILD_NOT_BOUND });
        return null;
    }
    const built = spec.buildPayload(req);
    const validation = runValidation(spec, server, guildId, built.actorUserId);
    if (!validation.ok) {
        res.status(HTTP_FORBIDDEN).json({ error: "validation_failed", failures: validation.failures });
        return null;
    }
    return { server, built };
}

export function mutationRoute(spec: MutationRouteSpec): Router {
    const router: Router = Router();
    router[spec.method](
        spec.path,
        validateGuildId,
        handleAsync(async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const gate = gateMutation(req, res, spec, guildId);
            if (!gate) return;
            try {
                const result = performMutation(spec, gate.server, guildId, gate.built);
                res.status(HTTP_OK).json({ ...result, ...(gate.built.responseExtras ?? {}) });
            } catch (err) {
                logger.error(`[discord] ${spec.auditAction} failed for ${guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: spec.failureCode });
            }
        }),
    );
    return router;
}
