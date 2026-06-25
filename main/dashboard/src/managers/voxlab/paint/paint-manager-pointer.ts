import { type BufferAttribute, type Intersection, type Mesh, type Vector3 } from "three";
import { eyedropMapper } from "../../../voxlab/mappers/eyedrop-mapper.js";
import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { BrushState } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import { cursorAtHit, raycastFromEvent, type RaycastCtx } from "./paint-manager-cursor.js";
import { requireColorAttribute } from "./paint-manager-apply.js";
import type { RgbTuple, StrokeDelta } from "./paint-manager-types.js";

export interface PointerCtx {
    meshes: MeshManager;
    canvas: HTMLCanvasElement;
    raycastCtx: RaycastCtx;
    cursorRef: { v: Mesh | null };
    cursorScratchNormal: Vector3;
    cursorScratchTarget: Vector3;
    brush: BrushState;
    footer: FooterPanelComponent;
    applyBrush: (p: Vector3) => void;
    setIsPointerDown: (v: boolean) => void;
    setStrokeBuffer: (m: Map<number, RgbTuple>) => void;
    setCurrentStrokeDelta: (d: StrokeDelta | null) => void;
    isPointerDown: () => boolean;
    commitStroke: () => void;
    onUndo: () => void;
    onRedo: () => void;
}

export function handlePointerDown(ctx: PointerCtx, e: PointerEvent): void {
    if (!ctx.brush.paintMode) return;
    if (ctx.brush.eyedropper) {
        performPointerEye(ctx, e);
        return;
    }
    ctx.setIsPointerDown(true);
    ctx.setStrokeBuffer(new Map());
    ctx.setCurrentStrokeDelta({ overrides: new Map(), parts: {} });
    ctx.canvas.setPointerCapture(e.pointerId);
    const hit = raycastFromEvent(ctx.raycastCtx, e);
    if (hit !== null) {
        cursorAtHit({
            meshes: ctx.meshes,
            cursorRef: ctx.cursorRef,
            scratchNormal: ctx.cursorScratchNormal,
            scratchTarget: ctx.cursorScratchTarget,
            hit,
        });
        ctx.applyBrush(hit.point);
    }
}

function performPointerEye(ctx: PointerCtx, e: PointerEvent): void {
    const mesh = ctx.meshes.mesh;
    if (!mesh) return;
    const positions = mesh.geometry.getAttribute("position") as BufferAttribute | undefined;
    const colorAttr = requireColorAttribute(ctx.meshes);
    if (!positions || !colorAttr) return;
    const hit = raycastFromEvent(ctx.raycastCtx, e);
    if (hit === null) return;
    const pickedColor = eyedropMapper(hit, positions, colorAttr);
    if (pickedColor === null) return;
    ctx.footer.paint.apply({ ...ctx.brush, color: pickedColor, eyedropper: false });
}

export function handleMoveHit(ctx: PointerCtx, hit: Intersection | null): void {
    if (hit === null) {
        if (ctx.cursorRef.v) ctx.cursorRef.v.visible = false;
        return;
    }
    cursorAtHit({
        meshes: ctx.meshes,
        cursorRef: ctx.cursorRef,
        scratchNormal: ctx.cursorScratchNormal,
        scratchTarget: ctx.cursorScratchTarget,
        hit,
    });
    if (ctx.isPointerDown()) ctx.applyBrush(hit.point);
}

export function handlePointerUp(ctx: PointerCtx, e: PointerEvent): void {
    if (!ctx.isPointerDown()) return;
    ctx.setIsPointerDown(false);
    ctx.commitStroke();
    try {
        ctx.canvas.releasePointerCapture(e.pointerId);
    } catch {
        void 0;
    }
}

export function handlePointerKey(ctx: PointerCtx, e: KeyboardEvent, action: "undo" | "redo" | null): void {
    if (!ctx.brush.paintMode || action === null) return;
    e.preventDefault();
    if (action === "undo") ctx.onUndo();
    else ctx.onRedo();
}
