import type { AuditSemantic } from "../audit-presenters/types.js";

const DESTRUCTIVE_ACTIONS = new Set([
    "server:manager.revoked",
    "server:whitelist.removed",
    "server:manager.request.denied",
    "server:auth.rejected",
    "server:claim.rejected",
    "server:claim.consent_rejected",
]);

export function tallySemantic(action: string): AuditSemantic {
    if (action.startsWith("client:")) return "chain";
    if (action.startsWith("server:read.")) return "read";
    if (DESTRUCTIVE_ACTIONS.has(action)) return "destructive";
    if (action.startsWith("server:")) return "write";
    return "system";
}
