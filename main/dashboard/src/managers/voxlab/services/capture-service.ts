import { scratchCanvas } from "../../../dom/factory/index.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";

export type CaptureFormat = "png" | "webp";

export interface CaptureBuffer {
    width: number;
    height: number;
    data: Uint8ClampedArray<ArrayBuffer>;
}

export class CaptureService {
    constructor(private readonly viewport: ViewportManager) {}

    capturePixels(width: number, height: number, transparent: boolean, motionTimeMs?: number): CaptureBuffer {
        const ss = Math.max(1, this.viewport.supersample);
        const internalW = Math.max(1, Math.round(width * ss));
        const internalH = Math.max(1, Math.round(height * ss));

        const raw = this.viewport.captureFramePixels(internalW, internalH, transparent, motionTimeMs);
        const flipped = captureFlip(raw, internalW, internalH);

        if (internalW === width && internalH === height) {
            return { width, height, data: flipped };
        }
        return captureDownsample({ src: flipped, srcW: internalW, srcH: internalH, dstW: width, dstH: height });
    }

    async captureFrame(opts: {
        width: number;
        height: number;
        format: CaptureFormat;
        transparent: boolean;
    }): Promise<Blob> {
        const { width, height, format, transparent } = opts;
        const pixels = this.capturePixels(width, height, transparent);
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
        if (!ctx) {
            throw new Error(`Failed to acquire 2D canvas context (${width}x${height})`);
        }
        const image = new ImageData(pixels.data, width, height);
        ctx.putImageData(image, 0, 0);
        return canvasToBlob(canvas, format);
    }
}

function captureFlip(pixels: Uint8Array, width: number, height: number): Uint8ClampedArray<ArrayBuffer> {
    const out = new Uint8ClampedArray(new ArrayBuffer(width * height * 4));
    const row = width * 4;
    for (let r = 0; r < height; r++) {
        const srcStart = r * row;
        const dstStart = (height - 1 - r) * row;
        out.set(pixels.subarray(srcStart, srcStart + row), dstStart);
    }
    return out;
}

type SmoothCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

function paintSourceCanvas(src: Uint8ClampedArray, srcW: number, srcH: number): HTMLCanvasElement | OffscreenCanvas {
    const srcCanvas = createCanvas(srcW, srcH);
    const srcCtx = srcCanvas.getContext("2d") as SmoothCtx | null;
    if (!srcCtx) throw new Error(`Failed to acquire downsample source context (${srcW}x${srcH})`);
    const buffer = src as unknown as Uint8ClampedArray<ArrayBuffer>;
    srcCtx.putImageData(new ImageData(buffer, srcW, srcH), 0, 0);
    return srcCanvas;
}

interface DownsampleArgs {
    src: Uint8ClampedArray;
    srcW: number;
    srcH: number;
    dstW: number;
    dstH: number;
}

function captureDownsample(args: DownsampleArgs): CaptureBuffer {
    const { src, srcW, srcH, dstW, dstH } = args;
    const srcCanvas = paintSourceCanvas(src, srcW, srcH);
    const dstCanvas = createCanvas(dstW, dstH);
    const dstCtx = dstCanvas.getContext("2d") as SmoothCtx | null;
    if (!dstCtx) throw new Error(`Failed to acquire downsample destination context (${dstW}x${dstH})`);
    dstCtx.imageSmoothingEnabled = true;
    dstCtx.imageSmoothingQuality = "high";
    dstCtx.drawImage(srcCanvas as unknown as CanvasImageSource, 0, 0, dstW, dstH);
    const dstImage = dstCtx.getImageData(0, 0, dstW, dstH);
    return { width: dstW, height: dstH, data: dstImage.data as unknown as Uint8ClampedArray<ArrayBuffer> };
}

function createCanvas(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
    if (typeof OffscreenCanvas !== "undefined") {
        return new OffscreenCanvas(width, height);
    }
    return scratchCanvas({ width, height, context: null, meta: null }).el;
}

async function canvasToBlob(canvas: HTMLCanvasElement | OffscreenCanvas, format: CaptureFormat): Promise<Blob> {
    const mime = format === "png" ? "image/png" : "image/webp";
    if (canvas instanceof OffscreenCanvas) {
        return canvas.convertToBlob({ type: mime });
    }
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error(`Failed to encode canvas to ${mime}`));
            }
        }, mime);
    });
}
