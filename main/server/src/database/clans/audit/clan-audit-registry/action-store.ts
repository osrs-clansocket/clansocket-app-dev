import type { ActionDef, AnyAuditAction } from "./action-def.js";
import type { PayloadValidator } from "./type-guards.js";

interface ActionEntry {
    def: ActionDef;
    validator: PayloadValidator;
}

const ACTIONS = new Map<string, ActionEntry>();

export function registerAuditAction(action: string, def: ActionDef, validator: PayloadValidator): void {
    ACTIONS.set(action, { def, validator });
}

export function isKnownAction(action: string): action is AnyAuditAction {
    return ACTIONS.has(action);
}

export function lookupAction(action: string): ActionDef | null {
    return ACTIONS.get(action)?.def ?? null;
}

export function validatePayload(action: string, payload: unknown): boolean {
    const entry = ACTIONS.get(action);
    if (!entry) return true;
    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return false;
    return entry.validator(payload as Record<string, unknown>);
}

export function clearAuditActions(): void {
    ACTIONS.clear();
}
