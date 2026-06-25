import type { WebGLRenderTarget, WebGLRenderer } from "three";

const RGBA_STRIDE = 4;

export function readbackTexture(
    renderer: WebGLRenderer,
    target: WebGLRenderTarget,
): { data: Uint8ClampedArray; width: number; height: number } {
    const w = target.width;
    const h = target.height;
    const buffer = new Uint8Array(w * h * RGBA_STRIDE);
    renderer.readRenderTargetPixels(target, 0, 0, w, h, buffer);
    const rowBytes = w * RGBA_STRIDE;
    const flipped = new Uint8ClampedArray(w * h * RGBA_STRIDE);
    for (let y = 0; y < h; y++) {
        const srcOff = (h - 1 - y) * rowBytes;
        const dstOff = y * rowBytes;
        for (let i = 0; i < rowBytes; i++) flipped[dstOff + i] = buffer[srcOff + i];
    }
    return { data: flipped, width: w, height: h };
}
