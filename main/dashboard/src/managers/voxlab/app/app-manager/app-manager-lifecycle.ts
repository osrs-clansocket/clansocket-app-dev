import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { HistoryService } from "../../services/history-service.js";
import type { MeshData } from "../../../../shared/types/voxlab/mesh/mesh-types.js";
import type { MeshManager } from "../../mesh/mesh-manager.js";
import type { OverlayComponent } from "../../../../dom/forms/voxlab/panels/overlay-component.js";
import type { PersistenceService } from "../../services/persistence-service.js";
import type { SidebarComponent } from "../../../../dom/forms/voxlab/panels/sidebar-component.js";
import type { SnapshotManager } from "../../snapshot-manager.js";
import type { TimelineManager } from "../../timeline/timeline-manager.js";
import type { ViewportManager } from "../../viewport/viewport-manager.js";
import type { InitialState } from "../voxlab-editor.js";

export interface LifecycleDeps {
    footer: FooterPanelComponent;
    sidebar: SidebarComponent;
    overlays: OverlayComponent;
    meshes: MeshManager;
    viewport: ViewportManager;
    snapshot: SnapshotManager;
    timeline: TimelineManager;
    history: HistoryService;
    persistence: PersistenceService;
    persistedRestoredRef: { v: boolean };
    hostManagedStateRef: { v: boolean };
}

export function applyMesh(deps: LifecycleDeps, meshData: MeshData, fileName: string, fileSize: number): void {
    const mesh = deps.meshes.loadMesh(meshData, deps.footer.wireframe.current.enabled);
    deps.overlays.hideEmpty();
    deps.sidebar.statsPanel.update(meshData, fileName, fileSize);
    deps.sidebar.setExportEnabled(true);
    deps.sidebar.setPublishEnabled(true);
    if (mesh.geometry.boundingBox) deps.viewport.resetCamera(mesh.geometry.boundingBox);
}

export function applyInitial(deps: LifecycleDeps, initial: InitialState): void {
    deps.hostManagedStateRef.v = true;
    if (initial.mesh) applyMesh(deps, initial.mesh, "host-mesh", 0);
    if (initial.snapshot) deps.snapshot.restore(initial.snapshot);
    if (initial.timeline) deps.timeline.load(initial.timeline);
    const snapshotCamera = initial.snapshot?.parts?.camera;
    if (snapshotCamera) deps.footer.camera.apply(snapshotCamera as Parameters<typeof deps.footer.camera.apply>[0]);
    deps.history.initialize(deps.snapshot.capture());
}

export function applyPresetSnapshot(deps: LifecycleDeps, snapshot: ReturnType<SnapshotManager["capture"]>): void {
    deps.snapshot.restore(snapshot);
    const captured = deps.snapshot.capture();
    deps.history.record(captured);
    if (deps.persistedRestoredRef.v && !deps.hostManagedStateRef.v) deps.persistence.saveSettings(captured);
}

export async function restorePersisted(deps: LifecycleDeps): Promise<void> {
    try {
        if (deps.hostManagedStateRef.v) return;
        const settings = deps.persistence.loadSettings();
        if (settings) {
            deps.snapshot.restore(settings);
            deps.history.record(deps.snapshot.capture());
        }
    } catch {
        void 0;
    } finally {
        deps.persistedRestoredRef.v = true;
    }
}

export function startViewport(deps: LifecycleDeps): void {
    const authoredCamera = deps.hostManagedStateRef.v ? deps.footer.camera.current : null;
    deps.viewport.start();
    if (authoredCamera) deps.viewport.applyCameraExact(authoredCamera);
    void restorePersisted(deps);
}
