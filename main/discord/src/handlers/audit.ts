import logger from "@clansocket/logger";
import { postAuditLog } from "../core/api-client.js";
import { AUDIT_ACTIONS, LOG_LEVELS } from "../core/constants.js";

function buildAuditCtx(guildId: any, userId: any) {
    return { guildId, userId };
}

async function emitAuditEvent(level: any, action: any, ctx: any, data: any = {}) {
    const suffix = ctx.userId ? ":" + ctx.userId : "";
    const message = `${action}: ${ctx.guildId}${suffix}`;
    logger.write(level, message, data);
    if (ctx.guildId && level !== LOG_LEVELS.DEBUG) {
        await postAuditLog(ctx.guildId, ctx.userId, action, data);
    }
}

async function logAuditError(err: any, ctx: any = {}) {
    await emitAuditEvent(LOG_LEVELS.ERROR, AUDIT_ACTIONS.ERROR_OCCURRED, buildAuditCtx(ctx.guildId, ctx.userId), {
        error: err.message,
        stack: err.stack,
        context: ctx,
    });
}

function auditInfoEmitter(action: any) {
    return (guildId: any, userId: any) => emitAuditEvent(LOG_LEVELS.INFO, action, buildAuditCtx(guildId, userId));
}

const logAuditUserJoin = auditInfoEmitter(AUDIT_ACTIONS.USER_JOINED);
const logAuditUserLeave = auditInfoEmitter(AUDIT_ACTIONS.USER_LEFT);
const logAuditServerAdd = auditInfoEmitter(AUDIT_ACTIONS.SERVER_ADDED);
const logAuditServerRemove = auditInfoEmitter(AUDIT_ACTIONS.SERVER_REMOVED);

export { logAuditError, logAuditServerAdd, logAuditServerRemove, logAuditUserJoin, logAuditUserLeave };
