import { type Material, type Mesh, type Scene } from "three";
import { rasterMeshAsync } from "../services/raster-mesh-service.js";
import type { MaterialSettings } from "../../../shared/types/voxlab/material-types.js";
import type { ConvertOptions } from "../../../shared/types/voxlab/options-types.js";
import type { ImagePixels, MeshData } from "../../../shared/types/voxlab/mesh/mesh-types.js";
import type { MaterialVariant } from "../../../shared/types/voxlab/viewport-types.js";
import { hexToRgb } from "./mesh-manager-pbr.js";
import { applyToMaterial } from "./mesh-manager-material.js";
import { buildMesh, createMaterialsVariant, disposeMesh, exportPainted } from "./mesh-manager-lifecycle.js";
import { MeshAuxMixin } from "./mesh-aux-mixin.js";

export { installBvhPatch } from "./mesh-manager-bvh.js";

export class MeshManager extends MeshAuxMixin {
    constructor(private readonly scene: Scene) {
        super();
        this.userScaleGroup.add(this.meshGroup);
        this.scene.add(this.userScaleGroup);
    }

    async convertImage(pixels: ImagePixels, options: ConvertOptions): Promise<MeshData> {
        this.originalImagePixels = { data: pixels.data, width: pixels.width, height: pixels.height };
        return rasterMeshAsync({
            imageData: { data: pixels.data, width: pixels.width, height: pixels.height },
            voxelResolution: options.voxelResolution,
            extrusionDepth: options.extrusionDepth,
            smoothingPasses: options.smoothingPasses,
            taubinRounds: options.taubinRounds,
            taubinLambda: options.taubinLambda,
            taubinMu: options.taubinMu,
            cornerAngleDegrees: options.cornerAngleDegrees,
            alphaThreshold: options.alphaThreshold,
            backFace: options.backFace,
            normalize: options.normalize,
            vertexColor: hexToRgb(options.vertexColor),
        });
    }

    loadMesh(meshData: MeshData, withWireframe: boolean): Mesh {
        this.disposeCurrent();
        const mesh = buildMesh({
            meshData,
            smoothShading: this.smoothShading,
            castShadows: this.castShadows,
            materials: this.createMaterials(this.currentMaterial),
        });
        this.meshGroup.add(mesh);
        this.currentMesh = mesh;
        this.currentMeshData = meshData;
        this.applyMaterialSettings(this.materialSettings);
        this.sourceTex.apply(this.currentMesh);
        this.pbr.applyAll(this.currentMesh);
        this.markChanged();
        if (withWireframe) this.showWireframe();
        this.dispatchEvent(new CustomEvent("mesh-loaded", { detail: mesh }));
        return mesh;
    }

    rebuild(withWireframe: boolean): Mesh | null {
        return this.currentMeshData ? this.loadMesh(this.currentMeshData, withWireframe) : null;
    }

    applyMaterialSettings(settings: MaterialSettings): void {
        this.materialSettings = settings;
        if (!this.currentMesh) return;
        const mat = this.currentMesh.material;
        if (Array.isArray(mat)) for (const m of mat) applyToMaterial(m, settings, this.colorCache);
        else applyToMaterial(mat, settings, this.colorCache);
    }

    get sourceImagePixels(): ImagePixels | null {
        return this.originalImagePixels;
    }
    get mesh(): Mesh | null {
        return this.currentMesh;
    }
    get meshData(): MeshData | null {
        return this.currentMeshData;
    }

    exportPaintedMesh(): MeshData | null {
        return this.currentMeshData && this.currentMesh ? exportPainted(this.currentMeshData, this.currentMesh) : null;
    }

    private disposeCurrent(): void {
        if (this.currentMesh) {
            disposeMesh(this.meshGroup, this.currentMesh);
            this.currentMesh = null;
        }
        this.hideWireframe();
    }

    dispose(): void {
        this.disposeCurrent();
        // eslint-disable-next-line lvi/no-raw-dom -- three.js Scene.remove, not DOM
        this.scene.remove(this.userScaleGroup);
    }

    protected createMaterials(variant: MaterialVariant): Material[] {
        return createMaterialsVariant(variant, (m: Material) =>
            this.dispatchEvent(new CustomEvent("material-created", { detail: m })),
        );
    }
}
