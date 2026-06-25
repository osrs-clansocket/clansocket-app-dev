import { clanVaultDb } from "../../database/core/clans.js";
import { vaultEntryType } from "../registries/entry-type-registry.js";
import { assertActor, recordVaultAudit } from "../recorders/audit-recorder.js";
import type { Actor, VerifyStatus } from "../shared/vault-types.js";

const NOW = (): number => Date.now();

export async function recordVerify(
    clanId: string,
    entry_key: string,
    status: VerifyStatus,
    actor: Actor,
): Promise<void> {
    assertActor(actor);
    const registered = vaultEntryType(entry_key);
    if (registered === null) return;
    const db = clanVaultDb(clanId);
    db.prepare("UPDATE vault_entries SET last_verified_at = ?, last_verified_status = ? WHERE entry_key = ?").run(
        NOW(),
        status,
        entry_key,
    );
    recordVaultAudit({ clanId, entry_key, actor, action: registered.auditActions.verify, extra: { status } });
}
