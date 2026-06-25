import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type {
    BrushChange,
    GradientApply,
    PartsFill,
    PartsReset,
} from "../../../shared/types/voxlab/paint/paint-types.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import {
    applyGradient as applyGradientFn,
    fillPart as fillPartFn,
    resetPart as resetPartFn,
    type PartsCtx,
} from "./paint-manager-parts.js";

export interface WireFooterDeps {
    footer: FooterPanelComponent;
    meshes: MeshManager;
    partsCtx: () => PartsCtx;
    applyBrushSettings: (s: BrushChange) => void;
    clearAllPaint: () => void;
}

export function wireFooterListeners(deps: WireFooterDeps): void {
    const { footer, meshes, partsCtx, applyBrushSettings, clearAllPaint } = deps;
    footer.parts.addEventListener("parts-fill", (e) => {
        const d = (e as CustomEvent<PartsFill>).detail;
        fillPartFn(partsCtx(), d.part, d.color);
    });
    footer.parts.addEventListener("parts-reset", (e) =>
        resetPartFn(partsCtx(), (e as CustomEvent<PartsReset>).detail.part),
    );
    footer.paint.addEventListener("brush-change", (e) => applyBrushSettings((e as CustomEvent<BrushChange>).detail));
    footer.paint.addEventListener("paint-clear-all", clearAllPaint);
    footer.gradient.addEventListener("gradient-apply", (e) =>
        applyGradientFn({ ...partsCtx(), meshes }, (e as CustomEvent<GradientApply>).detail),
    );
    footer.addEventListener("reset-all", clearAllPaint);
}

export interface WireCanvasDeps {
    canvas: HTMLCanvasElement;
    boundDown: (e: PointerEvent) => void;
    boundMove: (e: PointerEvent) => void;
    boundUp: (e: PointerEvent) => void;
    boundKey: (e: KeyboardEvent) => void;
}

export function wireCanvasListeners(deps: WireCanvasDeps): void {
    deps.canvas.addEventListener("pointerdown", deps.boundDown);
    deps.canvas.addEventListener("pointermove", deps.boundMove);
    deps.canvas.addEventListener("pointerup", deps.boundUp);
    deps.canvas.addEventListener("pointercancel", deps.boundUp);
    document.addEventListener("keydown", deps.boundKey);
}

export function unwireCanvasListeners(deps: WireCanvasDeps): void {
    deps.canvas.removeEventListener("pointerdown", deps.boundDown);
    deps.canvas.removeEventListener("pointermove", deps.boundMove);
    deps.canvas.removeEventListener("pointerup", deps.boundUp);
    deps.canvas.removeEventListener("pointercancel", deps.boundUp);
    document.removeEventListener("keydown", deps.boundKey);
}
