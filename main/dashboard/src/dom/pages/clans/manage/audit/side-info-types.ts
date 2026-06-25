import { snapshot, type Instance } from "../../../../factory";
import { clansClient } from "../../../../../state/clans/clans-client/index.js";
import {
    AUDIT_INTEGRITY_BROKEN_CLASS,
    AUDIT_INTEGRITY_CHECKING_CLASS,
    AUDIT_INTEGRITY_CLASS,
    AUDIT_INTEGRITY_OK_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";

export interface IntegrityState {
    ok: boolean;
    breakAtId: number | null;
    breakReason: string | null;
    rowsChecked: number;
}

export function applyIntegrityVerdict(label: Instance, trigger: Instance, result: IntegrityState): void {
    if (result.ok) {
        trigger.el.className = `${AUDIT_INTEGRITY_CLASS} ${AUDIT_INTEGRITY_OK_CLASS}`;
        label.setText(snapshot(`Chain ok · ${result.rowsChecked} rows`));
        return;
    }
    trigger.el.className = `${AUDIT_INTEGRITY_CLASS} ${AUDIT_INTEGRITY_BROKEN_CLASS}`;
    label.setText(
        snapshot(
            result.breakAtId !== null
                ? `chain broken at #${result.breakAtId} (${result.breakReason ?? "?"})`
                : "chain broken",
        ),
    );
}

export async function runIntegrityRefresh(
    slug: string,
    label: Instance,
    trigger: Instance,
    lastRef: { v: IntegrityState },
): Promise<void> {
    label.setText("Verifying…");
    trigger.el.className = `${AUDIT_INTEGRITY_CLASS} ${AUDIT_INTEGRITY_CHECKING_CLASS}`;
    const result = await clansClient.verifyAuditChain(slug);
    lastRef.v = result;
    applyIntegrityVerdict(label, trigger, result);
}
