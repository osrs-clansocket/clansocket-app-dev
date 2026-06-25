import { type Mesh, MeshStandardMaterial, SRGBColorSpace, type Texture } from "three";
import type { ImagePixels } from "../../../shared/types/voxlab/mesh/mesh-types.js";
import { makePbrTexture } from "./mesh-manager-pbr.js";

export class SourceTextureState {
    private texture: Texture | null = null;
    enabled = false;

    set(image: ImagePixels | null): void {
        if (this.texture) {
            this.texture.dispose();
            this.texture = null;
        }
        if (image) {
            const tex = makePbrTexture(image);
            tex.colorSpace = SRGBColorSpace;
            this.texture = tex;
        }
    }

    apply(currentMesh: Mesh | null): void {
        if (!currentMesh) return;
        const materials = currentMesh.material;
        if (!Array.isArray(materials)) return;
        const tex = this.enabled ? this.texture : null;
        for (const m of materials) {
            if (m instanceof MeshStandardMaterial) {
                m.map = tex;
                m.needsUpdate = true;
            }
        }
    }
}
