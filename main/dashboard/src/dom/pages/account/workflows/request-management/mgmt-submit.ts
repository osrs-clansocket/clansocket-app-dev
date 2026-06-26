import { paragraph, type Instance, textProps } from "../../../../factory";
import { clansClient, type ManagerSubmitResult } from "../../../../../state/clans/clans-client/index.js";
import { formatResultLine } from "./result-line-formatter.js";
import { ACCOUNT_REQUEST_RESULT_LINE_CLASS } from "../../../../../shared/constants/account-constants.js";
import type { ReqMgmtRefs } from "./mgmt-types.js";

function appendResultLines(
    statusEl: Instance,
    results: ManagerSubmitResult[],
    targets: { slug: string; displayName: string }[],
): void {
    statusEl.clear();
    for (let i = 0; i < results.length; i++) {
        statusEl.addChild(
            paragraph(
                textProps([ACCOUNT_REQUEST_RESULT_LINE_CLASS], formatResultLine(results[i], targets[i].displayName)),
            ),
        );
    }
}

export async function submitManagerRequests(
    refs: ReqMgmtRefs,
    resetForm: () => void,
    onResolved: () => void,
): Promise<void> {
    refs.errorEl.el.hidden = true;
    refs.statusEl.el.hidden = true;
    if (refs.chips.selectedClans.size === 0) {
        (refs.errorEl as ReturnType<typeof paragraph>).setText("Pick at least one clan from the dropdown.");
        refs.errorEl.el.hidden = false;
        return;
    }
    const rsn = refs.rsnInput.el.value.trim();
    const declaredRsn = rsn.length > 0 ? rsn : undefined;
    const targets = Array.from(refs.chips.selectedClans.values());
    const pending: Promise<ManagerSubmitResult>[] = [];
    for (const t of targets) pending.push(clansClient.requestManaged(t.slug, declaredRsn));
    const results: ManagerSubmitResult[] = await Promise.all(pending);
    appendResultLines(refs.statusEl, results, targets);
    refs.statusEl.el.hidden = false;
    resetForm();
    onResolved();
}
