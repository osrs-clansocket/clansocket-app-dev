import {
    Color,
    type Material,
    MeshDepthMaterial,
    MeshNormalMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
} from "three";
import type { MaterialSettings } from "../../../shared/types/voxlab/material-types.js";

export class ColorCache {
    readonly tint = new Color();
    readonly emissive = new Color();
    readonly sheen = new Color();
    private lastTintStr = "";
    private lastEmissiveStr = "";
    private lastSheenStr = "";

    applyTint(target: Color, value: string): void {
        if (value !== this.lastTintStr) {
            this.tint.set(value);
            this.lastTintStr = value;
        }
        target.copy(this.tint);
    }
    applyEmissive(target: Color, value: string): void {
        if (value !== this.lastEmissiveStr) {
            this.emissive.set(value);
            this.lastEmissiveStr = value;
        }
        target.copy(this.emissive);
    }
    applySheen(target: Color, value: string): void {
        if (value !== this.lastSheenStr) {
            this.sheen.set(value);
            this.lastSheenStr = value;
        }
        target.copy(this.sheen);
    }
}

function applyMaterialShading(material: Material, tintable: { flatShading?: boolean }, s: MaterialSettings): void {
    if (!("flatShading" in material)) return;
    const role = material.userData?.voxlabRole as "flat" | "smooth" | undefined;
    const target = role === "smooth" ? false : s.flatShading;
    if (tintable.flatShading !== target) {
        tintable.flatShading = target;
        material.needsUpdate = true;
    }
}

function applyMaterialProps(material: MeshStandardMaterial, s: MaterialSettings, cache: ColorCache): void {
    material.metalness = s.metalness;
    material.roughness = s.roughness;
    cache.applyEmissive(material.emissive, s.emissiveColor);
    material.emissiveIntensity = s.emissiveIntensity;
}

function applyPhysicalProps(material: MeshPhysicalMaterial, s: MaterialSettings, cache: ColorCache): void {
    material.clearcoat = s.clearcoat;
    material.clearcoatRoughness = s.clearcoatRoughness;
    material.ior = s.ior;
    material.sheen = s.sheen;
    cache.applySheen(material.sheenColor, s.sheenColor);
    material.anisotropy = s.anisotropy;
}

export function applyToMaterial(material: Material, s: MaterialSettings, cache: ColorCache): void {
    material.transparent = s.opacity < 1;
    material.opacity = s.opacity;
    const tintable = material as { color?: Color; flatShading?: boolean };
    if (
        tintable.color instanceof Color &&
        !(material instanceof MeshNormalMaterial) &&
        !(material instanceof MeshDepthMaterial)
    ) {
        cache.applyTint(tintable.color, s.tint);
    }
    if (material instanceof MeshStandardMaterial) applyMaterialProps(material, s, cache);
    if (material instanceof MeshPhysicalMaterial) applyPhysicalProps(material, s, cache);
    applyMaterialShading(material, tintable, s);
}

export function disposeMaterial(material: Material | Material[]): void {
    if (Array.isArray(material)) {
        for (const m of material) m.dispose();
    } else material.dispose();
}
