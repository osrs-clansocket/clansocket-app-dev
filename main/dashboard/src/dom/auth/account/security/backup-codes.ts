import {
    BTN_VARIANT_OUTLINE,
    button,
    derived,
    div,
    paragraph,
    type Child,
    type Instance,
} from "../../../factory/index.js";
import { isPasskeyError, passkeyClient } from "../../../../state/passkey/client/index.js";
import { backupMetaStore, type BackupMetaState } from "../../../../state/passkey/stores/backup-meta-store.js";
import { consumeCodes, renderCodesPanel } from "../../codes-panel.js";
import { FORM_HINT } from "../../../forms/form-classes.js";

function metaText(state: BackupMetaState): string {
    if (!state.loaded) return "loading…";
    if (state.meta === null) return "none generated yet.";
    return `${state.meta.remainingCount} of ${state.meta.totalCount} remaining.`;
}

function generateBtn(codesHost: Instance): Instance {
    const btn = button({
        variant: BTN_VARIANT_OUTLINE,
        compact: true,
        text: "Generate",
        context: "generate a fresh set of backup codes",
        meta: ["action", "account"],
        onClick: async () => {
            btn.el.disabled = true;
            const res = await passkeyClient.generateBackupCodes();
            btn.el.disabled = false;
            if (isPasskeyError(res)) return;
            codesHost.setChildren(renderCodesPanel(res.codes, res.fileContent, "Save these now. They appear once."));
            void backupMetaStore.refresh();
        },
    });
    return btn;
}

import { accountPanel } from "../account-panel.js";
import { defineAccountPanel } from "../registry.js";

defineAccountPanel({ key: "backup-codes", order: 40, build: () => backupCodesPanel() });

export function backupCodesPanel(): Instance {
    const codesHost = div({ context: null, meta: null });
    const meta = paragraph({
        classes: [FORM_HINT],
        text: derived(() => metaText(backupMetaStore.state$())),
        context: null,
        meta: null,
    });
    const btn = generateBtn(codesHost);
    const bodyChildren: Child[] = [meta];
    const fresh = consumeCodes();
    if (fresh !== null) bodyChildren.push(renderCodesPanel(fresh.codes, fresh.file, "ur new backup codes — save now."));
    bodyChildren.push(codesHost);
    return accountPanel({ title: "Backup codes", body: bodyChildren, footer: [btn] });
}
