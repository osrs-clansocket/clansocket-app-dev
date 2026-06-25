import type { BufferAttribute, Vector3 } from "three";
import type { MeshManager } from "../mesh/mesh-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";
import type { BrushState } from "../../../shared/types/voxlab/paint/paint-types.js";

export interface BackFaceArgs {
    normals?: BufferAttribute;
    cameraPos?: Vector3;
}

export function backFaceArgs(
    brush: BrushState,
    viewport: ViewportManager,
    mesh: NonNullable<MeshManager["mesh"]>,
): BackFaceArgs {
    if (!brush.hideBackFaces) return {};
    return {
        normals: mesh.geometry.getAttribute("normal") as BufferAttribute | undefined,
        cameraPos: viewport.camera.position,
    };
}
