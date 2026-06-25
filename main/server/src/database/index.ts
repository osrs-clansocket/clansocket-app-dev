export {
    initializeDatabase,
    closeDatabase,
    isDatabaseReady,
    getDb,
    getPluginDb,
    getStaticDb,
    getClanDb,
    clanPluginDb,
    discordGuildDb,
    listOpenModes,
    pluginModes,
    clanRelPath,
    DB_NAMES,
    STATIC_DB_NAMES,
    PLUGIN_DB_PREFIX,
} from "./core/database.js";
export { placeholdersFor } from "./core/db-ops.js";
export {
    slugify,
    provisionClan,
    clanByName,
    clanById,
    clanBySlug,
    orCreateClan,
    countClans,
} from "./clans/clan-store.js";
export type { ClanRow, ClanStatus, ProvisionClanArgs } from "./clans/clan-store.js";
export { seoBySlug, seoById, listPublicSlugs, updateClanSeo } from "./clans/clan-seo-store.js";
export type { ClanSeoRow, ClanSeoPatch } from "./clans/clan-seo-store.js";
export {
    recordClanRoster,
    isClanMember,
    getRosterRank,
    getPluginPresence,
    listFingerprintDiffs,
} from "./clans/access/clan-roster/index.js";
export type { ClanRosterMember, PluginPresence, ClanRosterDiff } from "./clans/access/clan-roster/index.js";
export { listAuditEntries } from "./clans/audit/clan-audit/list/index.js";
export { recordClanAudit } from "./clans/audit/clan-audit/record.js";
export { pruneOldAudit, anonymizeActor } from "./clans/audit/clan-audit/retention.js";
export { ingestAuditBatch } from "./clans/audit/clan-audit/ingest.js";
export { verifyAuditChain } from "./clans/audit/clan-audit/verify.js";
export { isRevertable, revertAuditEntry, REVERTABLE_ACTIONS } from "./clans/audit/clan-audit-revert/index.js";
export type { RevertResult } from "./clans/audit/clan-audit-revert/index.js";
export { broadcastAuditEntry, registerAuditListener } from "./clans/audit/clan-audit-stream.js";
export type { AuditStreamHandler } from "./clans/audit/clan-audit-stream.js";
export type { ClanAuditEntry, AuditListOptions, AuditListResult } from "./clans/audit/clan-audit/list/index.js";
export type { RecordAuditArgs } from "./clans/audit/clan-audit/record.js";
export type { ClientAuditEntry, IngestResult } from "./clans/audit/clan-audit/ingest.js";
export type { VerifyResult } from "./clans/audit/clan-audit/verify.js";
export { ClanAuditActions, ClanAuditTargetTypes } from "./clans/audit/clan-audit-actions.js";
export type { ClanAuditAction, AuditTargetType } from "./clans/audit/clan-audit-actions.js";
export {
    upsertSiteAccount,
    accountById,
    bindAccountHash,
    hashesForAccount,
    accountByHash,
    revokeBinding,
} from "./site/site-accounts/index.js";
export type { SiteAccountRow, SiteAccountProvider, AccountUpsertArgs } from "./site/site-accounts/index.js";
export { finalizeClanClaim, ClanClaimError } from "./clans/access/clan-claim-finalize.js";
export type { FinalizeClaimArgs } from "./clans/access/clan-claim-finalize.js";
export {
    addWhitelistRank,
    listClanWhitelist,
    revokeWhitelistEntry,
    isWhitelistedRank,
} from "./clans/access/clan-whitelist-store.js";
export type { ClanWhitelistRow, ClanWhitelistKind } from "./clans/access/clan-whitelist-store.js";
export {
    insertClanManager,
    isClanManager,
    listAccountManagers,
    listClanManagers,
    revokeClanManager,
} from "./clans/access/clan-manager-store.js";
export { resolveClanPosture, resolveLivePosture } from "./clans/access/clan-access-resolver.js";
export type { ClanPosture } from "./clans/access/clan-access-resolver.js";
export type { ClanManagerRow, ClanManagerRole, ManagerGrantedVia } from "./clans/access/clan-manager-store.js";
export { getGlobalPreset, setGlobalPreset, deleteGlobalPreset } from "./clans/access/clan-plugin-presets/global.js";
export type { GlobalPresetRecord } from "./clans/access/clan-plugin-presets/global.js";
export {
    getOverride,
    listOverrides,
    setOverride,
    deleteOverride,
} from "./clans/access/clan-plugin-presets/override.js";
export type { OverrideRecord } from "./clans/access/clan-plugin-presets/override.js";
export { effectivePreset } from "./clans/access/clan-plugin-presets/effective.js";
export {
    createManagerRequest,
    requestById,
    listPendingRequests,
    resolveManagerRequest,
} from "./clans/access/request-store.js";
export type {
    ManagerRequestRow,
    ManagerRequestSource,
    ManagerRequestStatus,
    CreateRequestArgs,
} from "./clans/access/request-store.js";
export { insert, insertIgnore, select, deleteRows, transaction } from "./core/operations.js";
export {
    recordPluginDisconnect,
    recordPluginIdentity,
    recordPluginLogin,
    touchPluginCurrent,
} from "./plugin/state/identity/index.js";
export { recordChat } from "./plugin/state/chat.js";
export { upsertCatalog } from "./plugin/state/combat-achievements/index.js";
export { markPluginConnected } from "./plugin/state/mark-plugin-connected.js";
export { markPluginDisconnected } from "./plugin/state/mark-plugin-disconnected.js";
export { recordPingPong } from "./plugin/state/record-ping-pong.js";
export { getPluginMetrics } from "./plugin/state/get-plugin-metrics.js";
export { clanPluginMetrics } from "./plugin/state/aggregate-clan-metrics.js";
export { titleLadder, recordSnapshot } from "./plugin/state/clan-titles.js";
export { routePluginEvent } from "./plugin/projection/routing/router.js";
export type { PluginIdentityRecord } from "./plugin/state/identity/index.js";
export type { ClanChatRecord } from "./plugin/state/chat.js";
export type { CatalogEntry } from "./plugin/state/combat-achievements/index.js";
export type { PluginMetrics } from "./plugin/state/get-plugin-metrics.js";
export type { TitleLadderEntry, ClanTitleEntry, SnapshotRecord } from "./plugin/state/clan-titles.js";
export {
    RSN_VERIFY_TTL_MS,
    CLAIM_CONSENT_TTL_MS,
    RSN_DISPLACED_CLEANUP_MS,
    RSN_DISPLACED_PLACEHOLDER_LEN,
    RSN_MAX_LEN,
    findRsnHolder,
    getAccountRsn,
    rsnsByAccount,
    placeholderFromHash,
} from "./site/rsn/state.js";
export { upsertVerifiedRsn } from "./site/rsn/upsert.js";
export { displacedToPurge, rsnSeen } from "./site/rsn/lookup.js";
export { createConsentRequest } from "./site/consent/create.js";
export { pendingByHash, pendingByRsn, pendingByAccount, allByAccount, consentById } from "./site/consent/query.js";
export { expirePendingConsents, cancelConsentRequest, resolveConsentRequest } from "./site/consent/mutate.js";
export type { RsnSource, AccountRsnRow, SiteRsnRow, DisplacedSiteAccount } from "./site/rsn/state.js";
export type { ConsentKind, ConsentStatus, ConsentRequestRow, CreateConsentArgs } from "./site/consent/types.js";
