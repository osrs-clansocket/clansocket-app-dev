import type { WomTabState } from "../../../dom/pages/clans/manage/wise-old-man/index-state.js";

export function tearDownShell(s: WomTabState): void {
    if (s.linkedShellRef.v) {
        s.linkedShellRef.v.dispose();
        s.linkedShellRef.v = null;
    }
}

export function makeRefreshShut(s: WomTabState): () => void {
    return (): void => {
        s.showLinkForm.set(false);
        void s.store.refresh();
        void s.detailsStore.refresh();
    };
}
