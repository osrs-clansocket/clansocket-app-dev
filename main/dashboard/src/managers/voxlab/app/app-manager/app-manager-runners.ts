import type { BakeRequest, CaptureRequest } from "../../../../dom/forms/voxlab/panels/export-panel-component.js";
import type { OverlayComponent } from "../../../../dom/forms/voxlab/panels/overlay-component.js";
import type { SidebarComponent } from "../../../../dom/forms/voxlab/panels/sidebar-component.js";
import type { TimelinePanelComponent } from "../../../../dom/forms/voxlab/panels/timeline/timeline-panel-component.js";
import { modalService } from "../../services/modal-service.js";
import { runBake, runCapture, runToggleTracking, type ActionsCtx } from "./app-manager-actions.js";
import type { PublishPayload } from "../voxlab-editor.js";

export interface WireSidebarDeps {
    sidebar: SidebarComponent;
    timelinePanel: TimelinePanelComponent;
    actionsCtx: () => ActionsCtx;
    runPublish: () => Promise<void>;
}

export function wireSidebarEvents(deps: WireSidebarDeps): void {
    deps.sidebar.addEventListener("publish-requested", () => {
        void deps.runPublish();
    });
    deps.sidebar.exportPanel.addEventListener("capture-requested", (e) => {
        void runCapture(deps.actionsCtx(), (e as CustomEvent<CaptureRequest>).detail);
    });
    deps.sidebar.exportPanel.addEventListener("bake-requested", (e) => {
        void runBake(deps.actionsCtx(), (e as CustomEvent<BakeRequest>).detail);
    });
    deps.timelinePanel.addEventListener("toggle-tracking-requested", () => {
        runToggleTracking(deps.actionsCtx());
    });
}

export async function runPublishGuarded(
    sidebar: SidebarComponent,
    overlays: OverlayComponent,
    publish: () => Promise<PublishPayload>,
    onPublish: ((p: PublishPayload) => Promise<void> | void) | undefined,
): Promise<void> {
    sidebar.setPublishBusy(true);
    await overlays.showBusy("Publishing…");
    try {
        const payload = await publish();
        await onPublish?.(payload);
    } catch (err) {
        void modalService.alert(`Publish failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        overlays.hideBusy();
        sidebar.setPublishBusy(false);
    }
}
