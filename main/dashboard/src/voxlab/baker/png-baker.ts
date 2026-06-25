import { Zip, ZipPassThrough } from "fflate";
import { scratchCanvas } from "../../dom/factory/index.js";
import type { CaptureBuffer } from "../../managers/voxlab/services/capture-service.js";

export interface PngSequenceAccumulator {
    push(frameIndex: number, frame: CaptureBuffer): Promise<void>;
    finalize(): Promise<Blob>;
}

interface ZipAccumulator {
    zip: Zip | null;
    resolveFinish: (() => void) | null;
    rejectFinish: ((err: Error) => void) | null;
    finishPromise: Promise<Blob>;
}

interface ZipAccumulatorBind {
    accumulator: ZipAccumulator;
    chunks: Uint8Array[];
    finalizedRef: { v: boolean };
    resolve: (b: Blob) => void;
    reject: (e: Error) => void;
}

function bindZipAccumulator(args: ZipAccumulatorBind): void {
    const { accumulator, chunks, finalizedRef, resolve, reject } = args;
    const zip = new Zip((err, chunk, final) => {
        if (err) {
            reject(err);
            return;
        }
        chunks.push(chunk);
        if (final) resolve(new Blob(chunks as BlobPart[], { type: "application/zip" }));
    });
    accumulator.zip = zip;
    accumulator.resolveFinish = () => {
        if (finalizedRef.v) return;
        finalizedRef.v = true;
        zip.end();
    };
    accumulator.rejectFinish = reject;
}

async function pushPngFrame(accumulator: ZipAccumulator, frameIndex: number, frame: CaptureBuffer): Promise<void> {
    const blob = await toPngBlob(frame);
    const buffer = new Uint8Array(await blob.arrayBuffer());
    const file = new ZipPassThrough(`frame-${String(frameIndex).padStart(6, "0")}.png`);
    if (!accumulator.zip) throw new Error("PNG-sequence zip writer not initialised");
    accumulator.zip.add(file);
    file.push(buffer, true);
}

export function pngAccumulator(): PngSequenceAccumulator {
    const chunks: Uint8Array[] = [];
    const finalizedRef = { v: false };
    const accumulator: ZipAccumulator = {
        zip: null,
        resolveFinish: null,
        rejectFinish: null,
        finishPromise: null as unknown as Promise<Blob>,
    };
    accumulator.finishPromise = new Promise<Blob>((resolve, reject) => {
        bindZipAccumulator({ accumulator, chunks, finalizedRef, resolve, reject });
    });
    return {
        push: (frameIndex, frame) => pushPngFrame(accumulator, frameIndex, frame),
        finalize: () => {
            accumulator.resolveFinish?.();
            return accumulator.finishPromise;
        },
    };
}

async function toPngBlob(frame: CaptureBuffer): Promise<Blob> {
    const canvas = createOff(frame.width, frame.height);
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!ctx) {
        throw new Error("Failed to acquire 2D canvas context for PNG encoding");
    }
    ctx.putImageData(new ImageData(frame.data, frame.width, frame.height), 0, 0);
    if (canvas instanceof OffscreenCanvas) {
        return canvas.convertToBlob({ type: "image/png" });
    }
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Failed to encode PNG frame"));
            }
        }, "image/png");
    });
}

function createOff(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
    if (typeof OffscreenCanvas !== "undefined") {
        return new OffscreenCanvas(width, height);
    }
    return scratchCanvas({ width, height, context: null, meta: null }).el;
}
