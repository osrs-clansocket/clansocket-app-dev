import { register } from "../../../clan-vault/index.js";
import { vaultAuditActions } from "../../../clan-vault/shared/vault-types.js";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { onByoDeleted } from "../handlers/deleted-handler.js";
import type { DiscordBotPayload } from "../types/payload-type.js";
import { validateDiscordBot } from "../validators/payload-validator.js";
import { verifyCreds } from "../verifiers/token-verifier.js";

const ENTRY_KEY_DISCORD_BOT = "discord-bot";
const ENTRY_TYPE_DISCORD_BOT = "discord-bot";
const SCHEMA_VERSION_V1 = 1;

export function registerVaultEntry(): void {
    register<DiscordBotPayload>({
        entry_key: ENTRY_KEY_DISCORD_BOT,
        entry_type: ENTRY_TYPE_DISCORD_BOT,
        schema_version: SCHEMA_VERSION_V1,
        validate: validateDiscordBot,
        verify: async (payload) => (await verifyCreds(payload)).status,
        onDelete: onByoDeleted,
        auditActions: vaultAuditActions(
            ClanAuditActions.VaultDiscordBotRead,
            ClanAuditActions.VaultDiscordBotWrite,
            ClanAuditActions.VaultDiscordBotDelete,
            ClanAuditActions.VaultDiscordBotVerify,
        ),
    });
}
