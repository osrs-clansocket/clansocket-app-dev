import { MeshStandardMaterial, type Mesh, type Texture } from "three";
import type { ImagePixels } from "../../../shared/types/voxlab/mesh/mesh-types.js";
import type { PbrMapSlot } from "../../../shared/types/voxlab/paint/paint-types.js";
import { PBR_SLOT_ORDER } from "../../../shared/constants/voxlab/texture-paint-constants.js";
import { applySlotMaterial, makePbrTexture } from "./mesh-manager-pbr.js";

export class PbrState {
    readonly textures: Record<PbrMapSlot, Texture | null> = {
        normal: null,
        roughness: null,
        metalness: null,
        ao: null,
    };
    private readonly owned: Record<PbrMapSlot, boolean> = {
        normal: false,
        roughness: false,
        metalness: false,
        ao: false,
    };
    readonly intensities: Record<PbrMapSlot, number> = { normal: 1, roughness: 1, metalness: 1, ao: 1 };

    setMap(slot: PbrMapSlot, image: ImagePixels | null): void {
        this.disposeSlot(slot);
        if (image) {
            this.textures[slot] = makePbrTexture(image);
            this.owned[slot] = true;
        }
    }

    setTexture(slot: PbrMapSlot, texture: Texture): void {
        this.disposeSlot(slot);
        this.textures[slot] = texture;
        this.owned[slot] = false;
    }

    private disposeSlot(slot: PbrMapSlot): void {
        const existing = this.textures[slot];
        if (existing !== null && this.owned[slot]) existing.dispose();
        this.textures[slot] = null;
        this.owned[slot] = false;
    }

    setIntensity(slot: PbrMapSlot, value: number): void {
        this.intensities[slot] = value;
    }

    setIntensities(intensities: Record<PbrMapSlot, number>): PbrMapSlot[] {
        const changed: PbrMapSlot[] = [];
        for (const slot of PBR_SLOT_ORDER) {
            if (this.intensities[slot] !== intensities[slot]) {
                this.intensities[slot] = intensities[slot];
                changed.push(slot);
            }
        }
        return changed;
    }

    applySlot(slot: PbrMapSlot, currentMesh: Mesh | null, updateTexture: boolean): void {
        if (!currentMesh) return;
        const materials = currentMesh.material;
        if (!Array.isArray(materials)) return;
        for (const m of materials) {
            if (m instanceof MeshStandardMaterial) {
                applySlotMaterial({ m, slot, updateTexture, textures: this.textures, intensities: this.intensities });
            }
        }
    }

    applyAll(currentMesh: Mesh | null): void {
        for (const slot of PBR_SLOT_ORDER) this.applySlot(slot, currentMesh, true);
    }
}
