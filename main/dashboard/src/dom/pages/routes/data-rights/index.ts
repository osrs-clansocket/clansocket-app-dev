import "../../../../styles/pages/routes/data-rights/index.css";
import type { Instance } from "../../../factory";
import { scopesStore } from "../../../../state/data-rights/stores/scopes-store.js";
import type { PageState } from "../../../../state/data-rights/page-state/types.js";
import { readUrl } from "../../../../state/data-rights/page-state/url.js";
import { setupWritesStream } from "../../../../state/data-rights/page-state/writes-stream.js";
import { wireChromeOffsets } from "../../../../state/effects/chrome-offsets.js";
import { getLocalScopes } from "../../../../state/data-rights/local-source.js";
import { filterScopes, makePageState, type RenderOpts } from "../../../../state/data-rights/page/index-state.js";
import { wireUnmountCleanup } from "../../../../state/data-rights/page/index-hosts.js";
import { initRefs } from "./index-refs.js";
import { buildCallbacks } from "../../../../state/data-rights/page/page-callbacks.js";

const NOOP_TEARDOWN = (): void => undefined;

export async function renderDataRights(opts: RenderOpts = {}): Promise<Instance> {
    await scopesStore.refresh();
    const scopes = filterScopes(opts);
    const fromUrl = readUrl(scopes);
    const state: PageState = makePageState(scopes, fromUrl);
    const refs = initRefs(opts, state);
    const tearDownOffsets = opts.embedded === true ? NOOP_TEARDOWN : wireChromeOffsets(refs.root.el);
    const closeWritesStreamRef: { v: (() => void) | null } = { v: null };
    wireUnmountCleanup(refs.root.el, () => {
        tearDownOffsets();
        refs.liveHandleRef.v?.teardown();
        if (closeWritesStreamRef.v) closeWritesStreamRef.v();
    });
    const cbs = buildCallbacks(refs);
    cbs.rerenderTreeRef.fn();
    await cbs.rebuildListRef.fn();
    cbs.rerenderDetail();
    closeWritesStreamRef.v = setupWritesStream({
        state,
        getLocalScopes,
        getTreeTarget: () => refs.treeInstanceRef.v,
        rerenderTree: cbs.rerenderTreeRef.fn,
    });
    return refs.root;
}
