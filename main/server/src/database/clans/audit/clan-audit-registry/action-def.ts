import type { AuditTargetType } from "../clan-audit-actions.js";
import type { AuditSource } from "./payload-types.js";

export type { AnyAuditAction, PayloadFor } from "./payloads/payload-map.js";

export interface ActionDef {
    source: AuditSource;
    schemaVersion: number;
    targetType: AuditTargetType | null;
    isStateChange: boolean;
    hasBeforeAfter: boolean;
}

export function def(
    source: AuditSource,
    targetType: AuditTargetType | null,
    isStateChange: boolean,
    opts: { hasBeforeAfter?: boolean; schemaVersion?: number } = {},
): ActionDef {
    return {
        source,
        targetType,
        isStateChange,
        hasBeforeAfter: opts.hasBeforeAfter ?? false,
        schemaVersion: opts.schemaVersion ?? 1,
    };
}
