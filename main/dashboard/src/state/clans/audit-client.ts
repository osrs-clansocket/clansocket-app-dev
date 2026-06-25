import { push } from "./audit-client-push.js";

export type { AuditMeta, BufferEntry } from "./audit-client-config.js";
export { startAuditClient } from "./audit-client-start.js";

export function recordClientClick(target: string, label?: string): void {
    push("client:click", target, label !== undefined ? { label } : null);
}

export function recordClientSubmit(target: string, meta: { fields: string[]; rsn?: string; label?: string }): void {
    push("client:submit", target, meta);
}

export function recordAiAction(
    verb: string,
    target: string | null,
    meta: import("./audit-client-config.js").AuditMeta = {},
): void {
    push(`ai:${verb}`, target, meta as Record<string, unknown>, "ai");
}
