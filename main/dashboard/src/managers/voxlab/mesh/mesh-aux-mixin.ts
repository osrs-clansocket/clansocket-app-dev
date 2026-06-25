import type { ImagePixels } from "../../../shared/types/voxlab/mesh/mesh-types.js";
import { setShadingMode } from "./mesh-manager-lifecycle.js";
import { MeshPbrMixin } from "./mesh-pbr-mixin.js";

export abstract class MeshAuxMixin extends MeshPbrMixin {
    setSmoothShading(enabled: boolean): void {
        this.smoothShading = enabled;
    }
    setShadingNormals(smoothShading: boolean): boolean {
        if (!this.currentMesh || !this.currentMeshData) return false;
        setShadingMode(this.currentMesh, this.currentMeshData, smoothShading);
        this.smoothShading = smoothShading;
        return true;
    }
    setShadowsEnabled(enabled: boolean): void {
        this.castShadows = enabled;
        if (this.currentMesh) {
            this.currentMesh.castShadow = enabled;
            this.currentMesh.receiveShadow = enabled;
        }
    }
    setUniformScale(scale: number): void {
        this.userScaleGroup.scale.setScalar(Number.isFinite(scale) && scale > 0 ? scale : 1);
    }

    setWireframeColor(color: string): void {
        this.wireframe.setColor(color);
    }
    setWireframeOpacity(opacity: number): void {
        this.wireframe.setOpacity(opacity);
    }
    showWireframe(): void {
        this.wireframe.show(this.meshGroup, this.currentMesh);
    }
    hideWireframe(): void {
        this.wireframe.hide(this.meshGroup);
    }

    setSourceTexture(image: ImagePixels | null): void {
        this.sourceTex.set(image);
        if (this.sourceTex.enabled) {
            this.sourceTex.apply(this.currentMesh);
            this.markChanged();
        }
    }
    setTextureEnabled(enabled: boolean): void {
        if (this.sourceTex.enabled === enabled) return;
        this.sourceTex.enabled = enabled;
        this.sourceTex.apply(this.currentMesh);
        this.markChanged();
    }
}
