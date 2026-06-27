import type { CustomizeTransform } from "../../../../../clans/icon/transform.js";
import type { AuditCommonPayload, BeforeAfter } from "../audit-common-types.js";

export interface RosterChangedPayload extends AuditCommonPayload {
    memberCount: number;
    diffCount: number;
    fromFingerprint: string | null;
    capturedByAccountHash: string;
}

export interface BrandingState {
    iconKind: string | null;
    iconValue: string | null;
    color: string | null;
}
export interface BrandingUpdatedPayload extends AuditCommonPayload, BeforeAfter<BrandingState> {}
export type BrandingCustomization = { ext: string; transform: CustomizeTransform } | { cleared: true };
export interface BrandingCustomizedPayload extends AuditCommonPayload {
    customized: BrandingCustomization;
}

export interface ClaimCompletedPayload extends AuditCommonPayload {
    displayName: string;
    slug: string;
}
export interface ClaimTransferredPayload extends AuditCommonPayload {
    newOwnerSiteAccountId: string;
    previousOwnerSiteAccountId: string | null;
}
export interface ClaimRejectedPayload extends AuditCommonPayload {
    reason: string;
}
export interface ConsentRequestedPayload extends AuditCommonPayload {
    declaredRsn: string;
    targetAccountHash?: string | null;
    declaredClanName?: string;
    declaredClanSlug?: string;
}
export interface ConsentResolvedPayload extends AuditCommonPayload {
    declaredRsn: string;
}

export interface ManagerGrantedPayload extends AuditCommonPayload {
    role: string;
    grantedVia: string;
    priorRole?: string | null;
    matchedRsn?: string;
    matchedRank?: string;
}
export interface ManagerRevokedPayload extends AuditCommonPayload {
    priorRole?: string | null;
}
export interface RequestCreated extends AuditCommonPayload {
    declaredRsn: string;
    source: string;
}
export interface RequestResolved extends AuditCommonPayload {
    targetSiteAccountId: string;
    declaredRsn: string;
}

export interface SeoUpdatedPayload extends AuditCommonPayload {
    fields: string[];
}
export interface WhitelistAddedPayload extends AuditCommonPayload {
    kind: string;
    value: string;
    label?: string | null;
}
export interface WhitelistRemovedPayload extends AuditCommonPayload {
    priorKind?: string;
    priorValue?: string;
}

export interface ClientClickPayload extends AuditCommonPayload {
    elementKey?: string;
    elementText?: string;
}
export interface ClientSubmitPayload extends AuditCommonPayload {
    formKey?: string;
    valid?: boolean;
    fields?: string[];
}
export interface ClientRoutePayload extends AuditCommonPayload {
    count?: number;
}
export interface ReadAuditPayload extends AuditCommonPayload {
    count: number;
    cursor?: unknown;
}
export interface AuthRejectedPayload extends AuditCommonPayload {
    endpoint: string;
    method: string;
    reason: string;
}

export interface VaultBase extends AuditCommonPayload {
    entry_key: string;
    component?: string;
}
export interface VaultBotRead extends VaultBase {
    hit?: boolean;
    reason?: string;
}
export interface VaultBotWrite extends VaultBase {
    entry_type?: string;
    reason?: string;
}
export type VaultBotDelete = VaultBase;
export interface VaultBotVerify extends VaultBase {
    status?: string;
}
export interface VaultWomRead extends VaultBase {
    hit?: boolean;
    reason?: string;
}
export interface VaultWomWrite extends VaultBase {
    entry_type?: string;
    reason?: string;
}
export type VaultWomDelete = VaultBase;
export interface VaultWomVerify extends VaultBase {
    status?: string;
}

export interface WomLinkerReassigned extends AuditCommonPayload {
    previous_linker: string;
    new_linker: string;
    by_owner: string;
}
export interface WomRsnChanged extends AuditCommonPayload {
    from: string;
    to: string;
    accountHashType?: "real" | "placeholder";
    womChangeId?: number;
}
export interface WomBackfillDone extends AuditCommonPayload {
    rowsInserted: number;
    rowsUpdated: number;
    rowsSkipped: number;
    msElapsed: number;
}
export interface WomBackfillFailed extends AuditCommonPayload {
    reason: string;
    lastErrorCode?: number;
    msElapsed: number;
}

export interface HomepageComponentsUpdatedPayload extends AuditCommonPayload {
    componentCount: number;
    fingerprint?: string;
    errorCount?: number;
}
export interface HomepageImageUploadedPayload extends AuditCommonPayload {
    imageKey: string;
    ext: string;
    byteSize: number;
}
export interface HomepageImageDeletedPayload extends AuditCommonPayload {
    imageKey: string;
}
