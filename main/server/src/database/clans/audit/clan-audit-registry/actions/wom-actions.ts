import { ClanAuditActions, ClanAuditTargetTypes } from "../../clan-audit-actions.js";
import { def } from "../action-def.js";
import { registerAuditAction } from "../action-store.js";
import { isNumber, isString, requireStrings } from "../type-guards.js";

registerAuditAction(
    ClanAuditActions.WomLinkLinkerReassigned,
    def("server", ClanAuditTargetTypes.WomLink, true),
    requireStrings("previous_linker", "new_linker", "by_owner"),
);

registerAuditAction(ClanAuditActions.WomRsnChanged, def("system", null, true), requireStrings("from", "to"));

registerAuditAction(
    ClanAuditActions.WomBackfillCompleted,
    def("system", ClanAuditTargetTypes.WomLink, false),
    (p) => isNumber(p.rowsInserted) && isNumber(p.rowsUpdated) && isNumber(p.rowsSkipped) && isNumber(p.msElapsed),
);

registerAuditAction(
    ClanAuditActions.WomBackfillFailed,
    def("system", ClanAuditTargetTypes.WomLink, false),
    (p) => isString(p.reason) && isNumber(p.msElapsed),
);
