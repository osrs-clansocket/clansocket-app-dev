import { ClanAuditActions, ClanAuditTargetTypes } from "../../clan-audit-actions.js";
import { def } from "../action-def.js";
import { registerAuditAction } from "../action-store.js";
import { isNumber, isPlainObject, isString } from "../type-guards.js";
import { alwaysTrue, requireDeclaredRsn, requireRequestResolved } from "../validator-predicates.js";
import { requireStrings } from "../type-guards.js";

registerAuditAction(
    ClanAuditActions.RosterChanged,
    def("server", ClanAuditTargetTypes.Roster, true),
    (p) =>
        isNumber(p.memberCount) &&
        isNumber(p.diffCount) &&
        isString(p.fromFingerprint) &&
        isString(p.capturedByAccountHash),
);

registerAuditAction(
    ClanAuditActions.ClaimCompleted,
    def("server", ClanAuditTargetTypes.Clan, true),
    requireStrings("displayName", "slug"),
);

registerAuditAction(
    ClanAuditActions.ClaimTransferred,
    def("server", ClanAuditTargetTypes.Clan, true, { hasBeforeAfter: true }),
    (p) => isString(p.newOwnerSiteAccountId) && isString(p.previousOwnerSiteAccountId),
);

registerAuditAction(
    ClanAuditActions.ClaimConsentRequested,
    def("server", ClanAuditTargetTypes.ConsentRequest, true),
    requireDeclaredRsn,
);

registerAuditAction(
    ClanAuditActions.ClaimConsentConfirmed,
    def("server", ClanAuditTargetTypes.ConsentRequest, true),
    requireDeclaredRsn,
);

registerAuditAction(
    ClanAuditActions.ClaimConsentRejected,
    def("server", ClanAuditTargetTypes.ConsentRequest, true),
    requireDeclaredRsn,
);

registerAuditAction(
    ClanAuditActions.ManagerGranted,
    def("server", ClanAuditTargetTypes.Manager, true, { hasBeforeAfter: true }),
    requireStrings("role", "grantedVia"),
);

registerAuditAction(ClanAuditActions.ManagerRevoked, def("server", ClanAuditTargetTypes.Manager, true), alwaysTrue);

registerAuditAction(
    ClanAuditActions.ManagerRequestCreated,
    def("server", ClanAuditTargetTypes.ManagerRequest, true),
    requireStrings("declaredRsn", "source"),
);

registerAuditAction(
    ClanAuditActions.ManagerRequestApproved,
    def("server", ClanAuditTargetTypes.ManagerRequest, true),
    requireRequestResolved,
);

registerAuditAction(
    ClanAuditActions.ManagerRequestDenied,
    def("server", ClanAuditTargetTypes.ManagerRequest, true),
    requireRequestResolved,
);

registerAuditAction(
    ClanAuditActions.BrandingUpdated,
    def("server", ClanAuditTargetTypes.Branding, true, { hasBeforeAfter: true }),
    (p) => isPlainObject(p.after) && (p.before === null || isPlainObject(p.before)),
);

registerAuditAction(ClanAuditActions.BrandingCustomized, def("server", ClanAuditTargetTypes.Branding, true), (p) =>
    isPlainObject(p.customized),
);

registerAuditAction(ClanAuditActions.SeoUpdated, def("server", ClanAuditTargetTypes.Clan, true), (p) =>
    Array.isArray(p.fields),
);

registerAuditAction(
    ClanAuditActions.WhitelistAdded,
    def("server", ClanAuditTargetTypes.Whitelist, true),
    requireStrings("kind", "value"),
);

registerAuditAction(ClanAuditActions.WhitelistRemoved, def("server", ClanAuditTargetTypes.Whitelist, true), alwaysTrue);

registerAuditAction(
    ClanAuditActions.AuthRejected,
    def("server", null, false),
    requireStrings("endpoint", "method", "reason"),
);

registerAuditAction(
    ClanAuditActions.ClaimRejected,
    def("server", ClanAuditTargetTypes.Clan, false),
    requireStrings("reason"),
);
