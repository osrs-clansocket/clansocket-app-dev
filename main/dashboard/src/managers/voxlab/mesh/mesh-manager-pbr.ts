import {
    ClampToEdgeWrapping,
    DataTexture,
    LinearFilter,
    LinearMipmapLinearFilter,
    MeshStandardMaterial,
    RGBAFormat,
    type Texture,
    UnsignedByteType,
} from "three";
import type { ImagePixels } from "../../../shared/types/voxlab/mesh/mesh-types.js";
import type { PbrMapSlot } from "../../../shared/types/voxlab/paint/paint-types.js";

const HEX_RGB_LEN = 6;

export function makePbrTexture(image: ImagePixels): DataTexture {
    const view = new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength);
    const tex = new DataTexture(view, image.width, image.height, RGBAFormat, UnsignedByteType);
    tex.minFilter = LinearMipmapLinearFilter;
    tex.magFilter = LinearFilter;
    tex.wrapS = ClampToEdgeWrapping;
    tex.wrapT = ClampToEdgeWrapping;
    tex.generateMipmaps = true;
    tex.flipY = true;
    tex.needsUpdate = true;
    return tex;
}

export function hexToRgb(hex: string): readonly [number, number, number] {
    const text = hex.startsWith("#") ? hex.slice(1) : hex;
    if (text.length !== HEX_RGB_LEN) return [1, 1, 1];
    const r = Number.parseInt(text.slice(0, 2), 16);
    const g = Number.parseInt(text.slice(2, 4), 16);
    const b = Number.parseInt(text.slice(4, 6), 16);
    if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) return [1, 1, 1];
    return [r / 255, g / 255, b / 255];
}

function applyTextureSlot(m: MeshStandardMaterial, slot: PbrMapSlot, texture: Texture | null): void {
    if (slot === "normal") m.normalMap = texture;
    else if (slot === "roughness") m.roughnessMap = texture;
    else if (slot === "metalness") m.metalnessMap = texture;
    else m.aoMap = texture;
}

function applyIntensitySlot(m: MeshStandardMaterial, slot: PbrMapSlot, intensity: number, hasTexture: boolean): void {
    if (slot === "normal") {
        m.normalScale.set(intensity, intensity);
        return;
    }
    if (slot === "ao") {
        m.aoMapIntensity = intensity;
        return;
    }
    if (slot === "roughness" && hasTexture) m.roughness = intensity;
    else if (slot === "metalness" && hasTexture) m.metalness = intensity;
}

export interface SlotMaterialArgs {
    m: MeshStandardMaterial;
    slot: PbrMapSlot;
    textures: Record<PbrMapSlot, Texture | null>;
    intensities: Record<PbrMapSlot, number>;
    updateTexture: boolean;
}

export function applySlotMaterial(args: SlotMaterialArgs): void {
    const { m, slot, textures, intensities, updateTexture } = args;
    const texture = textures[slot];
    if (updateTexture) {
        applyTextureSlot(m, slot, texture);
        m.needsUpdate = true;
    }
    applyIntensitySlot(m, slot, intensities[slot], texture !== null);
}
