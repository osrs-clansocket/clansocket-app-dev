import { div } from "../../../../dom/factory/index.js";
import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { LayoutManager } from "../../layout/layout-manager.js";
import type { LightingManager } from "../../lighting/lighting-manager.js";
import type { MeshManager } from "../../mesh/mesh-manager.js";
import type { OverlayComponent } from "../../../../dom/forms/voxlab/panels/overlay-component.js";
import type { SceneAugmentManager } from "../../lighting/scene-augment-manager.js";
import type { SidebarComponent } from "../../../../dom/forms/voxlab/panels/sidebar-component.js";
import type { TexturePaintManager } from "../../paint/texture-paint-manager.js";
import type { TimelinePanelComponent } from "../../../../dom/forms/voxlab/panels/timeline/timeline-panel-component.js";
import type { ViewportManager } from "../../viewport/viewport-manager.js";
import type { PbrGenerate } from "../../../../shared/types/voxlab/paint/paint-types.js";
import { runPaintExport, type ActionsCtx } from "./app-manager-actions.js";
import { runPbrGeneration, type PbrCtx } from "./app-manager-pbr.js";
import { wireStressAnchor } from "./app-manager-stress.js";
import { mountFooterSections } from "./app-manager-panels.js";
import { handleCameraIntent, wireSectionEvents } from "./app-manager-sections.js";
import { wireSidebarEvents } from "./app-manager-runners.js";
import { registerLayoutPanels, wireViewportEvents } from "./app-manager-init.js";

export interface SetupDeps {
    footer: FooterPanelComponent;
    sidebar: SidebarComponent;
    overlays: OverlayComponent;
    timelinePanel: TimelinePanelComponent;
    augment: SceneAugmentManager;
    lighting: LightingManager;
    meshes: MeshManager;
    viewport: ViewportManager;
    texturePaint: TexturePaintManager;
    canvas: HTMLCanvasElement;
    layout: LayoutManager;
    lastSmoothShadingRef: { v: boolean };
    onReloadRequested: () => void;
    actionsCtx: () => ActionsCtx;
    pbrCtx: () => PbrCtx;
    runPublish: () => Promise<void>;
}

function wireSetupSections(deps: SetupDeps): void {
    wireSidebarEvents({
        sidebar: deps.sidebar,
        timelinePanel: deps.timelinePanel,
        actionsCtx: deps.actionsCtx,
        runPublish: deps.runPublish,
    });
    wireSectionEvents({
        footer: deps.footer,
        meshes: deps.meshes,
        viewport: deps.viewport,
        lighting: deps.lighting,
        lastSmoothShadingRef: deps.lastSmoothShadingRef,
        onReloadRequested: deps.onReloadRequested,
        onCameraIntent: (intent) => handleCameraIntent(intent, deps.meshes, deps.viewport, deps.footer.camera.current),
    });
}

function wireSetupAnchors(deps: SetupDeps): void {
    wireViewportEvents(deps.viewport, deps.meshes, deps.footer);
    wireStressAnchor({
        canvas: deps.canvas,
        footer: deps.footer,
        meshes: deps.meshes,
        viewport: deps.viewport,
        augment: deps.augment,
    });
    deps.footer.pbrGeneration.addEventListener(
        "pbr-generate",
        (e) => void runPbrGeneration(deps.pbrCtx(), (e as CustomEvent<PbrGenerate>).detail),
    );
    deps.footer.paint.addEventListener("paint-export", () => runPaintExport(deps.actionsCtx()));
}

export function setupVoxlabApp(deps: SetupDeps): void {
    mountFooterSections(deps.footer, deps.sidebar);
    wireSetupSections(deps);
    registerLayoutPanels(deps.layout, deps.footer);
    deps.layout.attach({ left: deps.footer.panelsContainer, right: div({ context: null, meta: null }).el });
    wireSetupAnchors(deps);
}
