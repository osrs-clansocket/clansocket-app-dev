import { AsyncLocalStorage } from "node:async_hooks";

export { readCausedHeader } from "./caused-by-reader.js";

export interface AuditContext {
    causedBy?: string;
    requestId: string;
    startMs: number;
}

export const auditContext = new AsyncLocalStorage<AuditContext>();

export function getRequestId(): string | undefined {
    return auditContext.getStore()?.requestId;
}

export function getElapsedMs(): number | undefined {
    const ctx = auditContext.getStore();
    if (!ctx) return undefined;
    return Date.now() - ctx.startMs;
}
