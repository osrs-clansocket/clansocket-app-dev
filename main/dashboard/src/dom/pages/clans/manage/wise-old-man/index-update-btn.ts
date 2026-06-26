import type { Instance } from "../../../../factory";
import { effect } from "../../../../factory/reactive/index.js";
import type { WomStatus } from "../../../../../state/wom/clients/wom-client.js";
import { UPDATE_IN_FLIGHT_BTN, UPDATE_NOW_BTN, UPDATE_OUTAGE_BTN, UPDATE_QUEUED_BTN } from "./index-constants.js";

function paintUpdateBtn(updateBtn: Instance<HTMLButtonElement>, status: WomStatus): void {
    if (!status.linked) {
        updateBtn.el.disabled = false;
        updateBtn.setText(UPDATE_NOW_BTN);
        return;
    }
    if (status.outage_retry_at !== null) {
        updateBtn.el.disabled = true;
        updateBtn.setText(UPDATE_OUTAGE_BTN);
        return;
    }
    if (status.pending_update === null) {
        updateBtn.el.disabled = false;
        updateBtn.setText(UPDATE_NOW_BTN);
        return;
    }
    updateBtn.el.disabled = true;
    updateBtn.setText(status.pending_update.status === "pending" ? UPDATE_QUEUED_BTN : UPDATE_IN_FLIGHT_BTN);
}

export function wireUpdateBtn(updateBtn: Instance<HTMLButtonElement>, statusSignal: () => WomStatus): () => void {
    const disp = effect(() => paintUpdateBtn(updateBtn, statusSignal()));
    return () => disp.dispose();
}
