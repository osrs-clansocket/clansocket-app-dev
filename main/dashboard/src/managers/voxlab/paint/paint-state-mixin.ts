import { Color, Raycaster, Vector2, Vector3 } from "three";
import {
    DEFAULT_BRUSH_STATE,
    DEFAULT_PARTS_PAINT_STATE,
} from "../../../shared/constants/voxlab/texture-paint-constants.js";
import type { BrushState, MeshPart, PartsPaintState } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { VertexHashGrid } from "../../../voxlab/mappers/brush-mapper.js";
import { BoundedCache } from "../../../state/caches/bounded-cache.js";
import type { Mesh } from "three";
import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";
import {
    MAX_SYMMETRY_POINTS,
    PART_ORDER,
    type RgbTuple,
    type StrokeDelta,
    type VertexRange,
} from "./paint-manager-types.js";
import { applyAllPaint, applyPartial } from "./paint-manager-apply.js";
import { pushDelta } from "./paint-manager-history.js";

export abstract class PaintStateMixin extends EventTarget {
    protected partsState: PartsPaintState = { ...DEFAULT_PARTS_PAINT_STATE };
    protected overridesMap = new Map<number, RgbTuple>();
    protected baselineColors: Float32Array | null = null;
    protected brush: BrushState = { ...DEFAULT_BRUSH_STATE };
    protected readonly brushColor = new Color();
    protected readonly raycaster = new Raycaster();
    protected readonly ndc = new Vector2();
    protected readonly symmetryPoints: Vector3[] = Array.from({ length: MAX_SYMMETRY_POINTS }, () => new Vector3());
    protected readonly cursorScratchNormal = new Vector3();
    protected readonly cursorScratchTarget = new Vector3();
    protected isPointerDown = false;
    protected strokeBuffer = new Map<number, RgbTuple>();
    protected readonly cursorRef: { v: Mesh | null } = { v: null };
    protected strokeHistory: StrokeDelta[] = [];
    protected redoStack: StrokeDelta[] = [];
    protected currentStrokeDelta: StrokeDelta | null = null;
    protected vertexGrid: VertexHashGrid | null = null;
    protected readonly partRangeCache = new BoundedCache<MeshPart, VertexRange | null>({
        tag: "voxlab.paint.part-range",
        maxEntries: PART_ORDER.length,
    });
    protected pendingPointerMove: PointerEvent | null = null;
    protected moveRafScheduled = false;

    protected abstract readonly meshes: MeshManager;
    protected abstract readonly footer: FooterPanelComponent;
    protected abstract readonly viewport: ViewportManager;
    protected abstract readonly canvas: HTMLCanvasElement;

    protected emit(): void {
        this.dispatchEvent(new CustomEvent("paint-state-change"));
    }
    protected rangeOf(part: MeshPart): VertexRange | null {
        return this.partRangeCache.get(part) ?? null;
    }
    protected applyAll(): void {
        applyAllPaint({
            meshes: this.meshes,
            baselineColors: this.baselineColors,
            partsState: this.partsState,
            overridesMap: this.overridesMap,
            rangeOf: (p) => this.rangeOf(p),
        });
    }
    protected applyChanged(verts: Iterable<number>): void {
        applyPartial(
            {
                meshes: this.meshes,
                baselineColors: this.baselineColors,
                partsState: this.partsState,
                overridesMap: this.overridesMap,
                rangeOf: (p) => this.rangeOf(p),
            },
            verts,
        );
    }
    protected push(delta: StrokeDelta): void {
        pushDelta({ strokeHistory: this.strokeHistory, redoStack: this.redoStack }, delta);
    }
}
