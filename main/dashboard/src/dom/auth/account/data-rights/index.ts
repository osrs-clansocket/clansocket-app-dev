import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    effect,
    INLINE_CONFIRM_HOST_CLASS,
    paragraph,
    type Instance,
} from "../../../factory";
import { dataRightsClient } from "../../../../state/data-rights/data-rights-client/index.js";
import { userStatsStore } from "../../../../state/data-rights/stores/user-stats-store.js";
import { buildStatsGrid } from "./stats-grid.js";
import { reportExportResult } from "./action-export.js";
import { runLeaveFlow } from "./action-leave.js";
import { FORM_FORM_ROW, FORM_FORM_ROW_FILL, FORM_HINT } from "../../../forms/form-classes.js";
import { ACCOUNT_REMOVE_BTN_CLASS } from "../../../../shared/constants/account-constants.js";

import { accountPanel } from "../account-panel.js";
import { defineAccountPanel } from "../registry.js";

defineAccountPanel({ key: "data-rights", order: 70, build: () => dataRightsPanel() });

function buildExportBtn(status: Instance): Instance<HTMLButtonElement> {
    const exportBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,
        compact: true,
        text: "Export zip",
        context: "export all your data as a downloadable zip",
        meta: ["action", "data"],
        onClick: async () => {
            exportBtn.setText("Preparing…");
            exportBtn.el.disabled = true;
            const result = await dataRightsClient.exportSelfData();
            exportBtn.el.disabled = false;
            exportBtn.setText("Export zip");
            reportExportResult({ result, status });
        },
    });
    return exportBtn;
}

function buildLeaveBtn(args: { status: Instance; leaveHost: Instance }): Instance<HTMLButtonElement> {
    const { status, leaveHost } = args;
    const leaveBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,
        compact: true,
        classes: [ACCOUNT_REMOVE_BTN_CLASS],
        text: "Remove all data",
        context: "permanently delete all your data and leave the site",
        meta: ["destructive", "account"],
        onClick: () => void runLeaveFlow({ leaveBtn, leaveHost, status }),
    });
    return leaveBtn;
}

function buildBrowseBtn(): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        compact: true,
        text: "Browse my data",
        context: "browse your stored data table by table",
        meta: ["nav", "data"],
        onClick: () => {
            history.pushState(null, "", "/data-rights");
            window.dispatchEvent(new PopStateEvent("popstate"));
        },
    });
}

function wireStatsRefresh(root: Instance, stats: ReturnType<typeof buildStatsGrid>): void {
    let settled = false;
    root.trackDispose(
        effect(() => {
            const s = userStatsStore.stats$();
            if (s === null && !settled) return;
            settled = true;
            stats.set(s);
        }),
    );
}

export function dataRightsPanel(): Instance {
    const status = paragraph({ classes: [FORM_HINT], text: "", context: null, meta: null });
    const stats = buildStatsGrid();
    const exportBtn = buildExportBtn(status);
    const leaveHost = div({ classes: [INLINE_CONFIRM_HOST_CLASS], context: null, meta: null });
    const leaveBtn = buildLeaveBtn({ status, leaveHost });
    leaveHost.addChild(leaveBtn);
    const browseBtn = buildBrowseBtn();
    const root = accountPanel({
        title: "Data rights",
        body: [stats.el, status],
        footer: [
            div({ classes: [FORM_FORM_ROW, FORM_FORM_ROW_FILL], context: null, meta: null }, [browseBtn, exportBtn]),
            leaveHost,
        ],
    });
    wireStatsRefresh(root, stats);
    return root;
}
