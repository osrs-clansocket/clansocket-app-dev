import { snapshot, type Instance } from "../../../factory";
import { dataRightsClient } from "../../../../state/data-rights/data-rights-client/index.js";
import { confirmLeaveSite } from "./action-confirm-leave.js";

export async function runLeaveFlow(args: {
    leaveBtn: Instance<HTMLButtonElement>;
    leaveHost: Instance;
    status: Instance;
}): Promise<void> {
    const { leaveBtn, leaveHost, status } = args;
    const confirmed = await confirmLeaveSite(leaveHost);
    if (!confirmed) return;
    leaveBtn.setText("Wiping…");
    leaveBtn.el.disabled = true;
    const result = await dataRightsClient.deleteSelfData();
    leaveBtn.el.disabled = false;
    leaveBtn.setText("Remove all data");
    if (!result.ok) {
        status.setText(snapshot(result.message ?? `remove failed.`));
        return;
    }
    window.location.assign("/");
}
