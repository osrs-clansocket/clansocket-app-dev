import { BTN_VARIANT_PRIMARY, button, type Instance } from "../../../../factory";
import type { ReqMgmtRefs } from "./mgmt-types.js";

export interface MgmtBtnDeps {
    refs: ReqMgmtRefs;
    openBtn: Instance<HTMLButtonElement>;
    resetForm: () => void;
}

function handleCancel(d: MgmtBtnDeps): void {
    if (d.refs.formElRef.el) d.refs.formElRef.el.el.hidden = true;
    d.openBtn.el.hidden = false;
    d.refs.errorEl.el.hidden = true;
    d.refs.statusEl.el.hidden = true;
    d.resetForm();
}

export function buildMgmtBtns(d: MgmtBtnDeps): {
    submitBtn: Instance<HTMLButtonElement>;
    cancelBtn: Instance<HTMLButtonElement>;
} {
    const submitBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_PRIMARY,
        
        type: "submit",
        text: "Submit",
        context: "submit the manager request for the selected clans",
        meta: ["submit", "clan"],
    });
    const cancelBtn: Instance<HTMLButtonElement> = button({
        
        text: "Cancel",
        context: "cancel the manager request",
        meta: ["action"],
        onClick: () => handleCancel(d),
    });
    return { submitBtn, cancelBtn };
}
