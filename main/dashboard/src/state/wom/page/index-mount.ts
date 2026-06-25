import type { WomLinkedStatus } from "../clients/wom-client.js";
import { notLinkedView } from "../../../dom/pages/clans/manage/wise-old-man/index-link.js";
import { buildLinkedShell } from "../../../dom/pages/clans/manage/wise-old-man/index-shell.js";
import type { WomTabState } from "../../../dom/pages/clans/manage/wise-old-man/index-state.js";
import { tearDownShell } from "./index-tear-down.js";

export function mountNotLinked(s: WomTabState, refreshShut: () => void): void {
    if (s.mountedKindRef.v === "not-linked") return;
    tearDownShell(s);
    s.host.setChildren(notLinkedView(s.slug, refreshShut));
    s.mountedKindRef.v = "not-linked";
    s.mountedLinkerKeyRef.v = "";
}

export function mountLinked(args: {
    s: WomTabState;
    status: WomLinkedStatus;
    currentUserId: string;
    refreshShut: () => void;
}): void {
    const { s, status, currentUserId, refreshShut } = args;
    const linkerKey = `${status.linker_site_account_id}|${currentUserId}`;
    if (s.mountedKindRef.v === "linked" && linkerKey === s.mountedLinkerKeyRef.v) return;
    tearDownShell(s);
    s.linkedShellRef.v = buildLinkedShell({
        status,
        currentUserId,
        slug: s.slug,
        refresh: refreshShut,
        onRelink: () => s.showLinkForm.set(true),
        statusSignal: () => s.store.status$(),
        detailsSignal: s.detailsSignal,
        feedbackSignal: s.feedbackSignal,
        setFeedback: (msg) => s.feedbackSignal.set(msg),
    });
    s.host.setChildren(s.linkedShellRef.v.instance);
    s.mountedKindRef.v = "linked";
    s.mountedLinkerKeyRef.v = linkerKey;
}
