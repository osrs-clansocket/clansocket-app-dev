import { BTN_VARIANT_OUTLINE, button, div, type Instance, baseProps } from "../../../../factory";
import { inlineConfirm, INLINE_CONFIRM_HOST_CLASS } from "../../../../factory/layout-ops/inline/inline-confirm.js";
import { revokeWom, syncWomNow, updateWomNow } from "../../../../../state/wom/clients/wom-client.js";
import type { WomStatus } from "../../../../../state/wom/clients/wom-client.js";
import {
    ACTION_HOST_CLASS,
    ACTIONS_CLASS,
    formatEta,
    RELINK_BTN,
    SYNC_GATED_PREFIX,
    SYNC_NOW_BTN,
    SYNC_RUNNING,
    SYNC_UNAVAILABLE,
    UNLINK_BTN,
    UNLINK_CANCEL_CTX,
    UNLINK_CONFIRM_CTX,
    UNLINK_DONE,
    UPDATE_FAILED,
    UPDATE_NOW_BTN,
    UPDATE_RUNNING,
} from "./index-constants.js";
import { wireUpdateBtn } from "./index-update-btn.js";

export interface ActionsConfig {
    slug: string;
    refresh: () => void;
    onRelink: () => void;
    setFeedback: (msg: string) => void;
    statusSignal: () => WomStatus;
}

export interface ActionsHandle {
    instance: Instance;
    dispose: () => void;
}

async function runUpdateAction(cfg: ActionsConfig): Promise<void> {
    cfg.setFeedback("Asking WoM to update…");
    const result = await updateWomNow(cfg.slug);
    if (result.ok) {
        cfg.setFeedback(UPDATE_RUNNING);
        return;
    }
    cfg.setFeedback(`${UPDATE_FAILED} (${result.reason ?? "unknown"})`);
}

async function runSyncAction(cfg: ActionsConfig): Promise<void> {
    cfg.setFeedback("Syncing…");
    const result = await syncWomNow(cfg.slug);
    if (result.ok) {
        cfg.setFeedback(SYNC_RUNNING);
        cfg.refresh();
        return;
    }
    if (result.reason === "gated" && typeof result.next_eligible_at === "number") {
        cfg.setFeedback(`${SYNC_GATED_PREFIX}${formatEta(result.next_eligible_at)}.`);
        return;
    }
    cfg.setFeedback(`${SYNC_UNAVAILABLE} (${result.reason ?? "unknown"})`);
}

async function runUnlinkAction(args: { cfg: ActionsConfig; unlinkHost: Instance }): Promise<void> {
    const { cfg, unlinkHost } = args;
    const confirmed = await inlineConfirm(unlinkHost, {
        danger: true,
        cancelLabel: "Cancel",
        confirmLabel: "Unlink",
        cancelContext: UNLINK_CANCEL_CTX,
        confirmContext: UNLINK_CONFIRM_CTX,
    });
    if (!confirmed) return;
    const result = await revokeWom(cfg.slug);
    if (result.ok) {
        cfg.setFeedback(UNLINK_DONE);
        cfg.refresh();
        return;
    }
    cfg.setFeedback(`Unlink failed: ${result.reason ?? "unknown"}.`);
}

function actionBtn(text: string, context: string, meta: ("action" | "destructive")[], onClick: () => void): Instance {
    return button({ classes: [], variant: BTN_VARIANT_OUTLINE,  text, context, meta, onClick });
}

function buildRefreshButtons(cfg: ActionsConfig): { updateBtn: Instance; syncBtn: Instance } {
    return {
        updateBtn: actionBtn(
            UPDATE_NOW_BTN,
            "ask WoM to refresh all members' hiscores from Jagex now",
            ["action"],
            () => void runUpdateAction(cfg),
        ),
        syncBtn: actionBtn(
            SYNC_NOW_BTN,
            "trigger an immediate WoM backfill if the 24h gate allows",
            ["action"],
            () => void runSyncAction(cfg),
        ),
    };
}

function buildLinkButtons(
    cfg: ActionsConfig,
    unlinkHostRef: { v: Instance | null },
): { relinkBtn: Instance; unlinkBtn: Instance } {
    return {
        relinkBtn: actionBtn(
            RELINK_BTN,
            "re-link WoM credentials with a new group / code / api key",
            ["action"],
            cfg.onRelink,
        ),
        unlinkBtn: actionBtn(UNLINK_BTN, "revoke WoM credentials and clear the link", ["destructive"], () => {
            if (unlinkHostRef.v !== null) void runUnlinkAction({ cfg, unlinkHost: unlinkHostRef.v });
        }),
    };
}

function buildActionRow(
    cfg: ActionsConfig,
    unlinkHostRef: { v: Instance | null },
): { updateBtn: Instance; syncBtn: Instance; relinkBtn: Instance; unlinkBtn: Instance } {
    return { ...buildRefreshButtons(cfg), ...buildLinkButtons(cfg, unlinkHostRef) };
}

export function buildActionsRow(cfg: ActionsConfig): ActionsHandle {
    const unlinkHostRef: { v: Instance | null } = { v: null };
    const { updateBtn, syncBtn, relinkBtn, unlinkBtn } = buildActionRow(cfg, unlinkHostRef);
    const unlinkHost = div(baseProps([INLINE_CONFIRM_HOST_CLASS, ACTION_HOST_CLASS]), [unlinkBtn]);
    unlinkHostRef.v = unlinkHost;
    const instance = div(baseProps([ACTIONS_CLASS]), [updateBtn, syncBtn, relinkBtn, unlinkHost]);
    const dispose = wireUpdateBtn(updateBtn as Instance<HTMLButtonElement>, cfg.statusSignal);
    return { instance, dispose };
}
