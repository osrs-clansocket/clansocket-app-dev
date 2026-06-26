import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    effect,
    heading,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    snapshot,
    type Instance,
    baseProps,
} from "../../../factory";
import { profileStore } from "../../../../state/identity/stores/profile-store.js";
import { clansClient, type ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { managerRequests } from "./manager-requests.js";
import { buildClanWhitelist } from "./whitelist.js";
import { createSessionsRenderer } from "./clan-sessions-renderer.js";
import {
    ACCOUNT_CLAN_ACTIONS_ROW_CLASS,
    ACCOUNT_CLAN_DETAILS_CLASS,
    ACCOUNT_CLAN_FOOTER_CLASS,
    ACCOUNT_CLAN_PANEL_CLASS,
    ACCOUNT_CLAN_SESSIONS_CLASS,
    ACCOUNT_PANEL_TITLE_CLASS,
    ACCOUNT_REMOVE_BTN_CLASS,
} from "../../../../shared/constants/account-constants.js";

function buildNavBtn(args: { text: string; href: string; context: string }): Instance<HTMLButtonElement> {
    return button({
        variant: BTN_VARIANT_OUTLINE,

        text: args.text,
        context: args.context,
        meta: ["nav", "clan"],
        onClick: () => window.location.assign(args.href),
    });
}

async function runRemoveFlow(args: {
    clan: ManagedClan;
    removeHost: Instance;
    removeBtn: Instance<HTMLButtonElement>;
}): Promise<void> {
    const { clan, removeHost, removeBtn } = args;
    const confirmed = await inlineConfirm(removeHost, {
        cancelLabel: "Cancel",
        confirmLabel: "Delete forever",
        danger: true,
        cancelContext: `keep clan "${clan.displayName}"`,
        confirmContext: `confirm deleting clan "${clan.displayName}" and all its data`,
    });
    if (!confirmed) return;
    const ok = await clansClient.removeClan(clan.slug);
    if (ok) {
        window.location.reload();
        return;
    }
    removeBtn.setText("Remove failed");
}

function buildRemoveBtn(clan: ManagedClan, removeHost: Instance): Instance<HTMLButtonElement> {
    const removeBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,

        classes: [ACCOUNT_REMOVE_BTN_CLASS],
        text: "Remove clan",
        context: "permanently delete this clan and all its data",
        meta: ["destructive", "clan"],
        onClick: () => void runRemoveFlow({ clan, removeHost, removeBtn }),
    });
    return removeBtn;
}

function buildTransferBtn(clan: ManagedClan): Instance<HTMLButtonElement> {
    const transferBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,

        text: "Request ownership transfer",
        context: "request transfer of this clan's ownership",
        meta: ["action", "clan"],
        onClick: async () => {
            const result = await clansClient.requestTransfer(clan.slug);
            transferBtn.setText(
                snapshot(result.ok ? "Transfer succeeded" : `Transfer failed: ${result.message ?? result.reason}`),
            );
        },
    });
    return transferBtn;
}

function buildClanNav(clan: ManagedClan): Instance {
    return div(baseProps([ACCOUNT_CLAN_ACTIONS_ROW_CLASS]), [
        buildNavBtn({ text: "View clan", href: `/clans/${clan.slug}`, context: "open this clan's public page" }),
        buildNavBtn({
            text: "Manage clan",
            href: `/clans/${clan.slug}/manage`,
            context: "open this clan's management surface",
        }),
    ]);
}

function buildActionsPanel(clan: ManagedClan): Instance {
    const removeHost = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    removeHost.addChild(buildRemoveBtn(clan, removeHost));
    return div(baseProps([ACCOUNT_CLAN_PANEL_CLASS]), [
        heading("h3", { classes: [ACCOUNT_PANEL_TITLE_CLASS], text: "Actions", context: null, meta: null }),
        buildClanNav(clan),
        removeHost,
    ]);
}

export function buildClanDetails(clan: ManagedClan): Instance {
    const sessionsPanel = div(baseProps([ACCOUNT_CLAN_PANEL_CLASS, ACCOUNT_CLAN_SESSIONS_CLASS]));
    sessionsPanel.el.hidden = true;
    const details = div(baseProps([ACCOUNT_CLAN_DETAILS_CLASS]), [
        sessionsPanel,
        buildActionsPanel(clan),
        buildClanWhitelist(clan),
        managerRequests(clan),
        div(baseProps([ACCOUNT_CLAN_FOOTER_CLASS]), [buildTransferBtn(clan)]),
    ]);
    const sessionsRenderer = createSessionsRenderer(sessionsPanel);
    details.trackDispose(effect(() => sessionsRenderer.render(clan.id, profileStore.sessions$())));
    return details;
}
