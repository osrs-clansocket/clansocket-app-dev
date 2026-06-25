import { def } from "../action-def.js";
import { registerAuditAction } from "../action-store.js";
import { alwaysTrue, requireCount } from "../validator-predicates.js";
import { ClanAuditTargetTypes } from "../../clan-audit-actions.js";

registerAuditAction("server:read.managers", def("server", ClanAuditTargetTypes.Manager, false), requireCount);
registerAuditAction(
    "server:read.manager_requests",
    def("server", ClanAuditTargetTypes.ManagerRequest, false),
    requireCount,
);
registerAuditAction("server:read.audit_log", def("server", null, false), requireCount);
registerAuditAction("server:read.roster_diffs", def("server", ClanAuditTargetTypes.Roster, false), requireCount);
registerAuditAction("server:read.whitelist", def("server", ClanAuditTargetTypes.Whitelist, false), requireCount);

registerAuditAction("client:click", def("client", null, false), alwaysTrue);
registerAuditAction("client:submit", def("client", null, false), alwaysTrue);
registerAuditAction("client:route", def("client", null, false), alwaysTrue);
