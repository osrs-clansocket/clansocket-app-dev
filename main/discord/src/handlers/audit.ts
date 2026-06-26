import logger from "@clansocket/logger";
import { postAuditLog } from "../core/api-client.js";
import { AUDIT_ACTIONS, LOG_LEVELS } from "../core/constants.js";

interface AuditCtx {
    guildId: string;
    userId: string | null;
}

async function emitAuditEvent(level: any, action: any, ctx: AuditCtx, data: any = {}) {
    const suffix = ctx.userId ? ":" + ctx.userId : "";
    const message = `${action}: ${ctx.guildId}${suffix}`;
    logger.write(level, message, data);
    if (ctx.guildId && level !== LOG_LEVELS.DEBUG) {
        await postAuditLog(ctx.guildId, ctx.userId, action, data);
    }
}

async function logAuditError(err: any, ctx: any = {}) {
    await emitAuditEvent(
        LOG_LEVELS.ERROR,
        AUDIT_ACTIONS.ERROR_OCCURRED,
        { guildId: ctx.guildId, userId: ctx.userId ?? null },
        { error: err.message, stack: err.stack, context: ctx },
    );
}

function userEmitter(action: any) {
    return (guildId: string, userId: string) => emitAuditEvent(LOG_LEVELS.INFO, action, { guildId, userId });
}

function serverEmitter(action: any) {
    return (guildId: string) => emitAuditEvent(LOG_LEVELS.INFO, action, { guildId, userId: null });
}

const logAuditUserJoin = userEmitter(AUDIT_ACTIONS.USER_JOINED);
const logAuditUserLeave = userEmitter(AUDIT_ACTIONS.USER_LEFT);
const logAuditServerAdd = serverEmitter(AUDIT_ACTIONS.SERVER_ADDED);
const logAuditServerRemove = serverEmitter(AUDIT_ACTIONS.SERVER_REMOVED);

export { logAuditError, logAuditServerAdd, logAuditServerRemove, logAuditUserJoin, logAuditUserLeave };
