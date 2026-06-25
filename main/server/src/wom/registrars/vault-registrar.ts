import { register } from "../../clan-vault/index.js";
import { vaultAuditActions } from "../../clan-vault/shared/vault-types.js";
import { ClanAuditActions } from "../../database/clans/audit/clan-audit-actions.js";
import { onWomDeleted } from "../handlers/deleted-handler.js";
import type { WomPayload } from "../types/payload-type.js";
import { validateWomPayload } from "../validators/payload-validator.js";
import { verifyWomCredentials } from "../verifiers/credentials-verifier.js";

const ENTRY_KEY_WOM = "wom";
const ENTRY_TYPE_WOM = "wom";
const SCHEMA_VERSION_V1 = 1;

export function registerWomVault(): void {
    register<WomPayload>({
        entry_key: ENTRY_KEY_WOM,
        entry_type: ENTRY_TYPE_WOM,
        schema_version: SCHEMA_VERSION_V1,
        validate: validateWomPayload,
        verify: async (payload) => (await verifyWomCredentials(payload)).status,
        onDelete: onWomDeleted,
        auditActions: vaultAuditActions(
            ClanAuditActions.VaultWomRead,
            ClanAuditActions.VaultWomWrite,
            ClanAuditActions.VaultWomDelete,
            ClanAuditActions.VaultWomVerify,
        ),
    });
}
