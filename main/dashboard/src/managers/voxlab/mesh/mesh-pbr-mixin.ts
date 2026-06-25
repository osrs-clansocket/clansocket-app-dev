import { Group, type Material, type Mesh, type Texture } from "three";
import { DEFAULT_MATERIAL_SETTINGS } from "../../../shared/constants/voxlab/material-constants.js";
import type { MaterialSettings } from "../../../shared/types/voxlab/material-types.js";
import type { ImagePixels, MeshData } from "../../../shared/types/voxlab/mesh/mesh-types.js";
import type { PbrMapSlot } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { MaterialVariant } from "../../../shared/types/voxlab/viewport-types.js";
import { ColorCache, disposeMaterial } from "./mesh-manager-material.js";
import { PbrState } from "./mesh-pbr-state.js";
import { WireframeState } from "./mesh-manager-wireframe.js";
import { SourceTextureState } from "./mesh-tex-state.js";

export abstract class MeshPbrMixin extends EventTarget {
    readonly userScaleGroup = new Group();
    readonly meshGroup = new Group();
    protected currentMesh: Mesh | null = null;
    protected currentMeshData: MeshData | null = null;
    protected currentMaterial: MaterialVariant = "standard";
    protected smoothShading = false;
    protected castShadows = false;
    protected materialSettings: MaterialSettings = { ...DEFAULT_MATERIAL_SETTINGS };
    protected originalImagePixels: ImagePixels | null = null;
    protected readonly colorCache = new ColorCache();
    protected readonly pbr = new PbrState();
    protected readonly wireframe = new WireframeState();
    protected readonly sourceTex = new SourceTextureState();

    protected abstract createMaterials(variant: MaterialVariant): Material[];
    protected abstract applyMaterialSettings(settings: MaterialSettings): void;

    setMaterial(variant: MaterialVariant): void {
        this.currentMaterial = variant;
        if (!this.currentMesh) return;
        disposeMaterial(this.currentMesh.material);
        this.currentMesh.material = this.createMaterials(variant);
        this.applyMaterialSettings(this.materialSettings);
        this.sourceTex.apply(this.currentMesh);
        this.pbr.applyAll(this.currentMesh);
        this.markChanged();
    }

    setPbrMap(slot: PbrMapSlot, image: ImagePixels | null): void {
        this.pbr.setMap(slot, image);
        this.pbr.applySlot(slot, this.currentMesh, true);
        this.markChanged();
    }
    setPbrTexture(slot: PbrMapSlot, texture: Texture): void {
        this.pbr.setTexture(slot, texture);
        this.pbr.applySlot(slot, this.currentMesh, true);
        this.markChanged();
    }
    setPbrIntensity(slot: PbrMapSlot, value: number): void {
        this.pbr.setIntensity(slot, value);
        this.pbr.applySlot(slot, this.currentMesh, false);
        this.markChanged();
    }
    setPbrIntensities(intensities: Record<PbrMapSlot, number>): void {
        for (const slot of this.pbr.setIntensities(intensities)) this.pbr.applySlot(slot, this.currentMesh, false);
        this.markChanged();
    }

    protected markChanged(): void {
        this.dispatchEvent(new CustomEvent("changed"));
    }
}
