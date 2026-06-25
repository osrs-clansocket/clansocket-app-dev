import { clanVaultDb } from "../../database/core/clans.js";
import { vaultEntryType } from "../registries/entry-type-registry.js";
import { assertActor, recordVaultAudit } from "../recorders/audit-recorder.js";
import type { Actor } from "../shared/vault-types.js";

export async function deleteVaultEntry(clanId: string, entry_key: string, actor: Actor): Promise<void> {
    assertActor(actor);
    const registered = vaultEntryType(entry_key);
    if (registered === null) return;
    await registered.onDelete(clanId);
    const db = clanVaultDb(clanId);
    db.prepare("DELETE FROM vault_entries WHERE entry_key = ?").run(entry_key);
    recordVaultAudit({ clanId, entry_key, actor, action: registered.auditActions.delete });
}
