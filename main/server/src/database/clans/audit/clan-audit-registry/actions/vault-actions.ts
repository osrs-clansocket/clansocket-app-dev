import { ClanAuditActions, ClanAuditTargetTypes } from "../../clan-audit-actions.js";
import { def } from "../action-def.js";
import { registerAuditAction } from "../action-store.js";
import { requireVaultEntryKey } from "../validator-predicates.js";

registerAuditAction(
    ClanAuditActions.VaultDiscordBotRead,
    def("server", ClanAuditTargetTypes.VaultEntry, false),
    requireVaultEntryKey,
);
registerAuditAction(
    ClanAuditActions.VaultDiscordBotWrite,
    def("server", ClanAuditTargetTypes.VaultEntry, true),
    requireVaultEntryKey,
);
registerAuditAction(
    ClanAuditActions.VaultDiscordBotDelete,
    def("server", ClanAuditTargetTypes.VaultEntry, true),
    requireVaultEntryKey,
);
registerAuditAction(
    ClanAuditActions.VaultDiscordBotVerify,
    def("server", ClanAuditTargetTypes.VaultEntry, true),
    requireVaultEntryKey,
);
registerAuditAction(
    ClanAuditActions.VaultWomRead,
    def("server", ClanAuditTargetTypes.VaultEntry, false),
    requireVaultEntryKey,
);
registerAuditAction(
    ClanAuditActions.VaultWomWrite,
    def("server", ClanAuditTargetTypes.VaultEntry, true),
    requireVaultEntryKey,
);
registerAuditAction(
    ClanAuditActions.VaultWomDelete,
    def("server", ClanAuditTargetTypes.VaultEntry, true),
    requireVaultEntryKey,
);
registerAuditAction(
    ClanAuditActions.VaultWomVerify,
    def("server", ClanAuditTargetTypes.VaultEntry, true),
    requireVaultEntryKey,
);
