import type { ApplyCtx } from "./paint-manager-apply.js";
import type { RaycastCtx } from "./paint-manager-cursor.js";
import type { HistoryState } from "./paint-manager-history.js";
import type { PartsCtx } from "./paint-manager-parts.js";
import type { PointerCtx } from "./paint-manager-pointer.js";
import { PaintStateMixin } from "./paint-state-mixin.js";

export abstract class PaintContextsMixin extends PaintStateMixin {
    protected abstract applyBrush(p: import("three").Vector3): void;
    protected abstract commitStroke(): void;
    protected abstract undoStroke(): void;
    protected abstract redoStroke(): void;

    protected get applyCtx(): ApplyCtx {
        return {
            meshes: this.meshes,
            baselineColors: this.baselineColors,
            partsState: this.partsState,
            overridesMap: this.overridesMap,
            rangeOf: (p) => this.rangeOf(p),
        };
    }
    protected get raycastCtx(): RaycastCtx {
        return {
            meshes: this.meshes,
            canvas: this.canvas,
            viewport: this.viewport,
            raycaster: this.raycaster,
            ndc: this.ndc,
        };
    }
    protected get histState(): HistoryState {
        return {
            strokeHistory: this.strokeHistory,
            redoStack: this.redoStack,
            partsState: this.partsState,
            overridesMap: this.overridesMap,
            rangeOf: (p) => this.rangeOf(p),
        };
    }
    protected get partsCtx(): PartsCtx {
        return {
            partsState: this.partsState,
            overridesMap: this.overridesMap,
            rangeOf: (p) => this.rangeOf(p),
            pushDelta: (d) => this.push(d),
            applyAll: () => this.applyAll(),
            applyChanged: (v) => this.applyChanged(v),
            emit: () => this.emit(),
        };
    }
    private get pointerSetters(): Pick<PointerCtx, "setIsPointerDown" | "setStrokeBuffer" | "setCurrentStrokeDelta"> {
        return {
            setIsPointerDown: (v) => {
                this.isPointerDown = v;
            },
            setStrokeBuffer: (m) => {
                this.strokeBuffer = m;
            },
            setCurrentStrokeDelta: (d) => {
                this.currentStrokeDelta = d;
            },
        };
    }

    protected get pointerCtx(): PointerCtx {
        return {
            meshes: this.meshes,
            canvas: this.canvas,
            raycastCtx: this.raycastCtx,
            cursorRef: this.cursorRef,
            cursorScratchNormal: this.cursorScratchNormal,
            cursorScratchTarget: this.cursorScratchTarget,
            brush: this.brush,
            footer: this.footer,
            applyBrush: (p) => this.applyBrush(p),
            ...this.pointerSetters,
            isPointerDown: () => this.isPointerDown,
            commitStroke: () => this.commitStroke(),
            onUndo: () => this.undoStroke(),
            onRedo: () => this.redoStroke(),
        };
    }
}
