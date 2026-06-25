import { validateClansocketPermission } from "./permission.js";
import { validateBudget } from "./rate-limit-budget.js";

export interface OperationContext {
    botId: string;
    clanId: string;
    guildId: string;
    userId: string;
}

export interface OperationValidationSpec {
    requiredClansocketPermission: string;
    rateLimitRoute: string;
    rateLimitScopeKey?: string;
}

export type ValidationFailureKind = "clansocket_permission" | "rate_limit";

export interface ValidationFailure {
    kind: ValidationFailureKind;
    message: string;
    retryAfterMs?: number;
}

export interface OperationValidationResult {
    ok: boolean;
    failures: ValidationFailure[];
}

function checkPermission(spec: OperationValidationSpec, ctx: OperationContext, failures: ValidationFailure[]): void {
    const permOk = validateClansocketPermission({
        clanId: ctx.clanId,
        guildId: ctx.guildId,
        userId: ctx.userId,
        requiredKey: spec.requiredClansocketPermission,
    });
    if (!permOk) {
        failures.push({
            kind: "clansocket_permission",
            message: `User ${ctx.userId} lacks ${spec.requiredClansocketPermission} for guild ${ctx.guildId}`,
        });
    }
}

function checkRateLimit(spec: OperationValidationSpec, ctx: OperationContext, failures: ValidationFailure[]): void {
    const rl = validateBudget({ botId: ctx.botId, route: spec.rateLimitRoute, scopeKey: spec.rateLimitScopeKey });
    if (!rl.ok) {
        failures.push({
            kind: "rate_limit",
            message: `Rate limit hit for route ${spec.rateLimitRoute}`,
            retryAfterMs: rl.retryAfterMs,
        });
    }
}

export function validateOperation(spec: OperationValidationSpec, ctx: OperationContext): OperationValidationResult {
    const failures: ValidationFailure[] = [];
    checkPermission(spec, ctx, failures);
    checkRateLimit(spec, ctx, failures);
    return { ok: failures.length === 0, failures };
}
