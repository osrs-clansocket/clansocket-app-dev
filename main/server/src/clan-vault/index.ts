export { readVaultEntry } from "./operations/read-entry.js";
export { writeVaultEntry } from "./operations/write-entry.js";
export { deleteVaultEntry } from "./operations/delete-entry.js";
export { recordVerify } from "./operations/record-verify.js";
export { vaultKeys } from "./operations/list-entry-keys.js";
export { register, vaultEntryType, listKeys } from "./registries/entry-type-registry.js";
export type {
    Actor,
    EntryMetadata,
    PayloadValidator,
    RegisteredEntryType,
    VaultAuditActions,
    VerifyStatus,
    WriteResult,
} from "./shared/vault-types.js";
