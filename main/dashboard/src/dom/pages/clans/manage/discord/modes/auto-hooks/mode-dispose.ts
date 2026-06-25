import { inspectorOverride$ } from "../../../../../../../state/discord/inspector-override.js";
import type { Instance } from "../../../../../../factory";
import { clearPreviewState } from "./preview/preview-state.js";

export interface AutoHooksUnsub {
    channels: () => void;
    webhooks: () => void;
    autoHooks: () => void;
}

export function trackDispose(root: Instance, unsubs: AutoHooksUnsub, mountedRef: { v: boolean }): void {
    root.trackDispose({
        dispose: () => {
            mountedRef.v = false;
            unsubs.channels();
            unsubs.webhooks();
            unsubs.autoHooks();
            inspectorOverride$.set(null);
            clearPreviewState();
        },
    });
}
