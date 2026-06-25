import type { Response } from "express";
import { ERROR_COOLDOWN } from "../../shared/error-reasons.js";
import { HTTP_TOO_MANY_REQUESTS } from "../../shared/http/http-status.js";
import { checkCooldown, type DataActionKind } from "../cooldown.js";
import { bucketLabel } from "./bucket-label.js";

export interface CooldownGateArgs {
    siteAccountId: string;
    action: DataActionKind;
    targetId: string | null;
    messageSuffix: string;
    res: Response;
}

export function enforceCooldown(args: CooldownGateArgs): boolean {
    const cooldown = checkCooldown(args.siteAccountId, args.action, args.targetId);
    if (cooldown.ok) return true;
    args.res.status(HTTP_TOO_MANY_REQUESTS).json({
        error: ERROR_COOLDOWN,
        message: `Wait ${bucketLabel(cooldown.retryAfterMs!)} ${args.messageSuffix}`,
        retryAfterMs: cooldown.retryAfterMs,
    });
    return false;
}
