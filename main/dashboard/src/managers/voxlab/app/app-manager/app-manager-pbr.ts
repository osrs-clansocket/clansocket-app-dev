import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { MeshManager } from "../../mesh/mesh-manager.js";
import type { PbrEncodeService } from "../../services/pbr/pbr-encode-service.js";
import type { PbrChannelConfig, PbrChannelResult, PbrShaderService } from "../../services/pbr/pbr-shader-service.js";
import type { TextureBindManager } from "../../mesh/texture-bind-manager.js";
import type { PbrGenerate, PbrMapSlot, PbrMapsSettings } from "../../../../shared/types/voxlab/paint/paint-types.js";

export interface PbrCtx {
    footer: FooterPanelComponent;
    meshes: MeshManager;
    textureBind: TextureBindManager;
    pbrEncodeService: PbrEncodeService;
    pbrShaderService: PbrShaderService | null;
}

function buildChannelConfig(channels: PbrGenerate): PbrChannelConfig {
    const config: PbrChannelConfig = {};
    if (channels.normal) config.normal = { sobelStrength: channels.sobelStrength };
    if (channels.roughness) config.roughness = { invert: true };
    if (channels.metalness) config.metalness = { threshold: channels.metalnessThreshold };
    if (channels.ao) config.ao = { radius: channels.aoRadius };
    return config;
}

function collectEncodeChannels(
    result: ReturnType<PbrShaderService["generate"]>,
): Array<{ slot: PbrMapSlot; channel: PbrChannelResult }> {
    const out: Array<{ slot: PbrMapSlot; channel: PbrChannelResult }> = [];
    if (result.normal !== undefined) out.push({ slot: "normal", channel: result.normal });
    if (result.roughness !== undefined) out.push({ slot: "roughness", channel: result.roughness });
    if (result.metalness !== undefined) out.push({ slot: "metalness", channel: result.metalness });
    if (result.ao !== undefined) out.push({ slot: "ao", channel: result.ao });
    return out;
}

async function encodeChannels(
    ctx: PbrCtx,
    collected: Array<{ slot: PbrMapSlot; channel: PbrChannelResult }>,
): Promise<void> {
    const urls = await ctx.pbrEncodeService.encodeBatch(
        collected.map(({ slot, channel }) => ({
            slot,
            data: channel.pixels.data,
            width: channel.pixels.width,
            height: channel.pixels.height,
        })),
    );
    const next: PbrMapsSettings = { ...ctx.footer.pbrMaps.current };
    for (const { slot, channel } of collected) {
        const url = urls[slot];
        if (url === undefined) continue;
        ctx.textureBind.seedPbrPixels(url, channel.pixels);
        next[slot] = url;
    }
    ctx.footer.pbrMaps.apply(next);
}

async function resolvePbrSrc(ctx: PbrCtx): Promise<ImageData | null> {
    const uploadedUrl = ctx.footer.albedo.current.uploadedDataUrl;
    if (uploadedUrl) {
        try {
            const blob = await (await fetch(uploadedUrl)).blob();
            const bitmap = await createImageBitmap(blob);
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const c = canvas.getContext("2d");
            if (!c) return null;
            c.drawImage(bitmap, 0, 0);
            return c.getImageData(0, 0, bitmap.width, bitmap.height);
        } catch {
            void 0;
        }
    }
    const sourcePixels = ctx.meshes.sourceImagePixels;
    if (!sourcePixels) return null;
    return new ImageData(new Uint8ClampedArray(sourcePixels.data), sourcePixels.width, sourcePixels.height);
}

export async function runPbrGeneration(ctx: PbrCtx, channels: PbrGenerate): Promise<void> {
    const imageData = await resolvePbrSrc(ctx);
    if (!imageData || ctx.pbrShaderService === null) return;
    try {
        const result = ctx.pbrShaderService.generate(imageData, buildChannelConfig(channels));
        await encodeChannels(ctx, collectEncodeChannels(result));
    } catch {
        void 0;
    }
}
