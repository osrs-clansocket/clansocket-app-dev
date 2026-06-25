import "../../../../../styles/pages/clans/manage/clan-wise-old-man-page.css";
import { effect } from "../../../../factory/reactive/index.js";
import { identityStore } from "../../../../../state/identity/stores/identity-store.js";
import { defineManageTab } from "../registry";
import { freshWomTab } from "./index-state.js";
import { makeRefreshShut } from "../../../../../state/wom/page/index-tear-down.js";
import { mountLinked, mountNotLinked } from "../../../../../state/wom/page/index-mount.js";

export function buildWomTab(slug: string): HTMLElement {
    const s = freshWomTab(slug);
    const refreshShut = makeRefreshShut(s);
    void s.store.ensure().then(() => void s.detailsStore.refresh());
    s.host.trackDispose(
        effect(() => {
            const status = s.store.status$();
            const uid = identityStore.session$()?.id ?? "";
            if (!status.linked || s.showLinkForm()) {
                mountNotLinked(s, refreshShut);
                return;
            }
            mountLinked({ s, status, refreshShut, currentUserId: uid });
        }),
    );
    return s.host.el;
}

defineManageTab({ key: "wise-old-man", build: (slug) => buildWomTab(slug), order: 40 });
