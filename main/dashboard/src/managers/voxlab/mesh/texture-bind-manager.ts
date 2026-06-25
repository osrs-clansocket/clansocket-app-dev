import { BoundedCache } from "../../../state/caches/bounded-cache.js";
import { PBR_SLOT_ORDER } from "../../../shared/constants/voxlab/texture-paint-constants.js";
import type { ImagePixels } from "../../../shared/types/voxlab/mesh/mesh-types.js";
import type { PbrMapSlot } from "../../../shared/types/voxlab/paint/paint-types.js";
import type { AlbedoSection } from "../../../dom/forms/voxlab/texture/sections/albedo-section.js";
import type { PbrMapsSection } from "../../../dom/forms/voxlab/texture/sections/pbr-maps-section.js";
import type { MeshManager } from "./mesh-manager.js";

interface TextureBindDeps {
    meshes: MeshManager;
    albedo: AlbedoSection;
    pbrMaps: PbrMapsSection;
}

export class TextureBindManager {
    private readonly meshes: MeshManager;
    private readonly albedo: AlbedoSection;
    private readonly pbrMaps: PbrMapsSection;
    private sourceOverride: ImagePixels | null = null;
    private readonly pbrPixelsCache = new BoundedCache<string, ImagePixels>({ tag: "voxlab", maxEntries: 8 });
    private readonly appliedUrls = new Map<PbrMapSlot, string | null>();

    private readonly onAlbedoChange = (): void => void this.applyAlbedo();
    private readonly onPbrChange = (): void => this.applyPbr();
    private readonly onMeshLoaded = (): void => this.applyAll();

    constructor(deps: TextureBindDeps) {
        this.meshes = deps.meshes;
        this.albedo = deps.albedo;
        this.pbrMaps = deps.pbrMaps;
        this.albedo.addEventListener("albedo-change", this.onAlbedoChange);
        this.pbrMaps.addEventListener("pbr-maps-change", this.onPbrChange);
        this.meshes.addEventListener("mesh-loaded", this.onMeshLoaded);
    }

    dispose(): void {
        this.albedo.removeEventListener("albedo-change", this.onAlbedoChange);
        this.pbrMaps.removeEventListener("pbr-maps-change", this.onPbrChange);
        this.meshes.removeEventListener("mesh-loaded", this.onMeshLoaded);
    }

    seedPbrPixels(url: string, pixels: ImagePixels): void {
        this.pbrPixelsCache.set(url, pixels);
    }

    async setSourceImage(dataUrl: string): Promise<void> {
        this.sourceOverride = await decodeImagePixels(dataUrl);
    }

    applyAll(): void {
        void this.applyAlbedo();
        this.applyPbr();
    }

    private resolveSource(): ImagePixels | null {
        return this.sourceOverride ?? this.meshes.sourceImagePixels;
    }

    private async applyAlbedo(): Promise<void> {
        const settings = this.albedo.current;
        if (settings.source === "source-image") {
            this.bindSource(this.resolveSource());
            return;
        }
        if (settings.source === "uploaded" && settings.uploadedDataUrl) {
            this.bindSource(await decodeImagePixels(settings.uploadedDataUrl));
            return;
        }
        this.clearSource();
    }

    private bindSource(pixels: ImagePixels | null): void {
        if (!pixels) {
            this.clearSource();
            return;
        }
        this.meshes.setSourceTexture(pixels);
        this.meshes.setTextureEnabled(true);
    }

    private clearSource(): void {
        this.meshes.setTextureEnabled(false);
        this.meshes.setSourceTexture(null);
    }

    private applyPbr(): void {
        const settings = this.pbrMaps.current;
        for (const slot of PBR_SLOT_ORDER) {
            const url = settings[slot];
            if (this.appliedUrls.get(slot) === url) continue;
            this.appliedUrls.set(slot, url);
            if (!url) this.meshes.setPbrMap(slot, null);
            else void this.applyPbrSlot(slot, url);
        }
        this.meshes.setPbrIntensities({
            normal: settings.normalScale,
            roughness: settings.roughnessIntensity,
            metalness: settings.metalnessIntensity,
            ao: settings.aoIntensity,
        });
    }

    private async applyPbrSlot(slot: PbrMapSlot, dataUrl: string): Promise<void> {
        const cached = this.pbrPixelsCache.get(dataUrl);
        if (cached !== undefined) {
            this.meshes.setPbrMap(slot, cached);
            return;
        }
        const pixels = await decodeImagePixels(dataUrl);
        if (!pixels) return;
        this.pbrPixelsCache.set(dataUrl, pixels);
        this.meshes.setPbrMap(slot, pixels);
    }
}

async function decodeImagePixels(dataUrl: string): Promise<ImagePixels | null> {
    let pixels: ImagePixels | null = null;
    try {
        const blob = await (await fetch(dataUrl)).blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(bitmap, 0, 0);
            const image = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
            pixels = { data: image.data, width: image.width, height: image.height };
        }
    } catch {
        void 0;
    }
    return pixels;
}
