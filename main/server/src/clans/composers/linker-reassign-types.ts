import type { AnyAuditAction } from "../../database/clans/audit/clan-audit-registry/index.js";

export interface LinkerReassignSpec<TIdentity> {
    auditAction: AnyAuditAction;
    identityResolver: (clanId: string) => TIdentity | null;
    reassignFn: (clanId: string, newLinkerSiteAccountId: string) => boolean;
    targetIdFor: (identity: TIdentity) => string;
    previousLinkerFor: (identity: TIdentity) => string;
    notFoundReason: string;
}

export interface LinkerReassignContext {
    clanId: string;
    sid: string;
}

export interface LinkerReassignBody {
    new_linker_user_id?: string;
}
