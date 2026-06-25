import {
    DoubleSide,
    type Intersection,
    type Material,
    Mesh,
    MeshBasicMaterial,
    type Raycaster,
    RingGeometry,
    type Vector2,
    Vector3,
} from "three";
import {
    BRUSH_CURSOR_COLOR_HEX,
    BRUSH_CURSOR_INNER_RADIUS_RATIO,
    BRUSH_CURSOR_OPACITY,
    BRUSH_CURSOR_OUTER_RADIUS_RATIO,
    BRUSH_CURSOR_SEGMENTS,
} from "../../../shared/constants/voxlab/texture-paint-constants.js";
import type { BrushState } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { MeshManager } from "../mesh/mesh-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";
import { BRUSH_CURSOR_RENDER_ORDER, NDC_HALF, NDC_RANGE } from "./paint-manager-types.js";

function buildCursorMesh(): Mesh {
    const geom = new RingGeometry(
        BRUSH_CURSOR_INNER_RADIUS_RATIO,
        BRUSH_CURSOR_OUTER_RADIUS_RATIO,
        BRUSH_CURSOR_SEGMENTS,
    );
    const mat = new MeshBasicMaterial({
        color: BRUSH_CURSOR_COLOR_HEX,
        transparent: true,
        opacity: BRUSH_CURSOR_OPACITY,
        side: DoubleSide,
        depthTest: false,
    });
    const mesh = new Mesh(geom, mat);
    mesh.visible = false;
    mesh.renderOrder = BRUSH_CURSOR_RENDER_ORDER;
    return mesh;
}

export interface SyncCursorCtx {
    brush: BrushState;
    cursorRef: { v: Mesh | null };
    viewport: ViewportManager;
}

export function syncBrushCursor(ctx: SyncCursorCtx): void {
    if (ctx.brush.paintMode) {
        if (!ctx.cursorRef.v) {
            ctx.cursorRef.v = buildCursorMesh();
            ctx.viewport.scene.add(ctx.cursorRef.v);
        }
        ctx.cursorRef.v.scale.setScalar(ctx.brush.radius);
    } else if (ctx.cursorRef.v) {
        // eslint-disable-next-line lvi/no-raw-dom -- three.js Scene.remove, not DOM
        ctx.viewport.scene.remove(ctx.cursorRef.v);
        ctx.cursorRef.v.geometry.dispose();
        (ctx.cursorRef.v.material as Material).dispose();
        ctx.cursorRef.v = null;
    }
}

export interface RaycastCtx {
    meshes: MeshManager;
    canvas: HTMLCanvasElement;
    viewport: ViewportManager;
    raycaster: Raycaster;
    ndc: Vector2;
}

export function raycastFromEvent(ctx: RaycastCtx, e: PointerEvent): Intersection | null {
    const mesh = ctx.meshes.mesh;
    if (!mesh) return null;
    const rect = ctx.canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * NDC_RANGE - NDC_HALF;
    const ndcY = -((e.clientY - rect.top) / rect.height) * NDC_RANGE + NDC_HALF;
    ctx.ndc.set(ndcX, ndcY);
    ctx.raycaster.setFromCamera(ctx.ndc, ctx.viewport.camera);
    const hits = ctx.raycaster.intersectObject(mesh, false);
    return hits.length > 0 ? hits[0] : null;
}

export interface CursorHitArgs {
    meshes: MeshManager;
    cursorRef: { v: Mesh | null };
    scratchNormal: Vector3;
    scratchTarget: Vector3;
    hit: Intersection;
}

export function cursorAtHit(args: CursorHitArgs): void {
    const { meshes, cursorRef, scratchNormal, scratchTarget, hit } = args;
    if (!cursorRef.v) return;
    const mesh = meshes.mesh;
    if (!mesh) return;
    cursorRef.v.visible = true;
    cursorRef.v.position.copy(hit.point);
    if (hit.face) {
        scratchNormal.copy(hit.face.normal).transformDirection(mesh.matrixWorld);
        scratchTarget.copy(hit.point).add(scratchNormal);
        cursorRef.v.lookAt(scratchTarget);
    }
}
