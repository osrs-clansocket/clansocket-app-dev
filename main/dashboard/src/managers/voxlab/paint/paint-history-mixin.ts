import { type BufferAttribute } from "three";
import {
    BRUSH_GRID_CELL_SIZE,
    DEFAULT_PARTS_PAINT_STATE,
} from "../../../shared/constants/voxlab/texture-paint-constants.js";
import type { PaintSnapshotState } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { SnapshotRegistry } from "../../../state/voxlab/registries/snapshot-registry.js";
import { VertexHashGrid } from "../../../voxlab/mappers/brush-mapper.js";
import { mapFromOverrides, PART_ORDER } from "./paint-manager-types.js";
import { computeRange } from "./paint-manager-apply.js";
import { clearAllPaint as clearAllPaintFn } from "./paint-manager-parts.js";
import { redoStroke, snapshotPaintState, undoStroke } from "./paint-manager-history.js";
import { PaintContextsMixin } from "./paint-contexts-mixin.js";

export abstract class PaintHistoryMixin extends PaintContextsMixin {
    clearAllPaint(): void {
        clearAllPaintFn(this.partsCtx, DEFAULT_PARTS_PAINT_STATE, (s) => {
            this.partsState = s;
        });
    }
    undoStroke(): void {
        const c = undoStroke(this.histState);
        if (c) {
            this.applyChanged(c);
            this.emit();
        }
    }
    redoStroke(): void {
        const c = redoStroke(this.histState);
        if (c) {
            this.applyChanged(c);
            this.emit();
        }
    }
    protected registerSnapshot(registry: SnapshotRegistry): void {
        registry.register<PaintSnapshotState>({
            name: "paint",
            getState: () => snapshotPaintState(this.partsState, this.overridesMap),
            applyState: (state) => {
                this.partsState = { ...state.parts };
                this.overridesMap = mapFromOverrides(state.overrides);
                this.applyAll();
            },
            paths: [],
        });
    }

    protected captureBaseline(): void {
        const mesh = this.meshes.mesh;
        if (!mesh) return;
        const colorAttr = mesh.geometry.getAttribute("color") as BufferAttribute | undefined;
        if (!colorAttr) return;
        this.baselineColors = new Float32Array(colorAttr.array);
        const positions = mesh.geometry.getAttribute("position") as BufferAttribute | undefined;
        this.vertexGrid = positions ? new VertexHashGrid(positions, BRUSH_GRID_CELL_SIZE) : null;
        this.partRangeCache.clear();
        for (const p of PART_ORDER) this.partRangeCache.set(p, computeRange(this.meshes, p));
    }
}
