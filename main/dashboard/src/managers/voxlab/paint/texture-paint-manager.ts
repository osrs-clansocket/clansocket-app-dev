import { type Vector3 } from "three";
import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { BrushChange } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { SnapshotRegistry } from "../../../state/voxlab/registries/snapshot-registry.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";
import { detectUndoRedo } from "./paint-manager-types.js";
import { raycastFromEvent, syncBrushCursor } from "./paint-manager-cursor.js";
import { applyBrushStroke, commitStrokeFn } from "./paint-manager-stroke.js";
import { handlePointerKey, handlePointerDown, handleMoveHit, handlePointerUp } from "./paint-manager-pointer.js";
import { unwireCanvasListeners, wireCanvasListeners, wireFooterListeners } from "./paint-manager-wire.js";
import { PaintHistoryMixin } from "./paint-history-mixin.js";

export class TexturePaintManager extends PaintHistoryMixin {
    protected readonly meshes: MeshManager;
    protected readonly footer: FooterPanelComponent;
    protected readonly viewport: ViewportManager;
    protected readonly canvas: HTMLCanvasElement;

    private wireFooterMesh(footer: FooterPanelComponent): void {
        this.meshes.addEventListener("mesh-loaded", () => {
            this.captureBaseline();
            this.applyAll();
        });
        wireFooterListeners({
            footer,
            meshes: this.meshes,
            partsCtx: () => this.partsCtx,
            applyBrushSettings: (s) => this.applyBrushSettings(s),
            clearAllPaint: () => this.clearAllPaint(),
        });
    }

    constructor(deps: {
        meshes: MeshManager;
        footer: FooterPanelComponent;
        registry: SnapshotRegistry;
        viewport: ViewportManager;
        canvas: HTMLCanvasElement;
    }) {
        super();
        this.meshes = deps.meshes;
        this.footer = deps.footer;
        this.viewport = deps.viewport;
        this.canvas = deps.canvas;
        this.wireFooterMesh(deps.footer);
        wireCanvasListeners(this.wireDeps);
        this.registerSnapshot(deps.registry);
    }

    private readonly boundDown = (e: PointerEvent): void => handlePointerDown(this.pointerCtx, e);
    private readonly boundMove = (e: PointerEvent): void => this.onPointerMove(e);
    private readonly boundUp = (e: PointerEvent): void => handlePointerUp(this.pointerCtx, e);
    private readonly boundKey = (e: KeyboardEvent): void => handlePointerKey(this.pointerCtx, e, detectUndoRedo(e));

    private get wireDeps(): {
        canvas: HTMLCanvasElement;
        boundDown: (e: PointerEvent) => void;
        boundMove: (e: PointerEvent) => void;
        boundUp: (e: PointerEvent) => void;
        boundKey: (e: KeyboardEvent) => void;
    } {
        return {
            canvas: this.canvas,
            boundDown: this.boundDown,
            boundMove: this.boundMove,
            boundUp: this.boundUp,
            boundKey: this.boundKey,
        };
    }

    dispose(): void {
        unwireCanvasListeners(this.wireDeps);
    }

    private applyBrushSettings(s: BrushChange): void {
        this.brush = { ...s };
        this.brushColor.set(this.brush.color);
        this.viewport.controls.enabled = !this.brush.paintMode;
        this.viewport.setAutoShadow(!this.brush.paintMode);
        syncBrushCursor({ brush: this.brush, cursorRef: this.cursorRef, viewport: this.viewport });
    }

    private onPointerMove(e: PointerEvent): void {
        if (!this.brush.paintMode) return;
        this.pendingPointerMove = e;
        if (this.moveRafScheduled) return;
        this.moveRafScheduled = true;
        requestAnimationFrame(() => {
            this.moveRafScheduled = false;
            const ev = this.pendingPointerMove;
            if (!ev) return;
            this.pendingPointerMove = null;
            handleMoveHit(this.pointerCtx, raycastFromEvent(this.raycastCtx, ev));
        });
    }

    protected commitStroke(): void {
        const ref = { v: this.currentStrokeDelta };
        commitStrokeFn({
            strokeBuffer: this.strokeBuffer,
            overridesMap: this.overridesMap,
            currentStrokeDeltaRef: ref,
            pushDelta: (d) => this.push(d),
            emit: () => this.emit(),
        });
        this.currentStrokeDelta = ref.v;
    }

    protected applyBrush(worldPoint: Vector3): void {
        applyBrushStroke(
            {
                meshes: this.meshes,
                viewport: this.viewport,
                brush: this.brush,
                brushColor: this.brushColor,
                symmetryPoints: this.symmetryPoints,
                vertexGrid: this.vertexGrid,
                baselineColors: this.baselineColors,
                currentStrokeDelta: this.currentStrokeDelta,
                strokeBuffer: this.strokeBuffer,
                overridesMap: this.overridesMap,
            },
            worldPoint,
        );
    }
}
