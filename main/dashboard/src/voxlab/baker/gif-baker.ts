import GIF from "gif.js";
import type { CaptureBuffer } from "../../managers/voxlab/services/capture-service.js";

const MAGENTA_TRANSPARENT_KEY = 0xff00ff;
const ALPHA_CUTOFF = 128;
const MIN_GIF_FRAME_DELAY_MS = 20;
const RGBA_STRIDE = 4;
const RGBA_ALPHA_OFFSET = 3;
const BYTE_FULL = 0xff;

export interface GifFrameAccumulator {
    push(frame: CaptureBuffer, durationMs: number): void;
    finalize(): Promise<Blob>;
}

export function createGifAccumulator(width: number, height: number, workerScript?: string): GifFrameAccumulator {
    const gif = new GIF({
        width,
        height,
        workerScript,
        workers: 2,
        quality: 10,
        transparent: MAGENTA_TRANSPARENT_KEY,
    });
    return {
        push(frame, durationMs) {
            const flattened = flattenAlpha(frame.data);
            const image = new ImageData(flattened, frame.width, frame.height);
            gif.addFrame(image, { delay: Math.max(MIN_GIF_FRAME_DELAY_MS, Math.round(durationMs)), copy: true });
        },
        finalize() {
            return new Promise<Blob>((resolve, reject) => {
                gif.on("finished", (blob) => resolve(blob));
                gif.on("abort", () => reject(new Error("GIF render aborted")));
                gif.render();
            });
        },
    };
}

function flattenAlpha(data: Uint8ClampedArray<ArrayBuffer>): Uint8ClampedArray<ArrayBuffer> {
    const out = new Uint8ClampedArray(new ArrayBuffer(data.byteLength));
    for (let i = 0; i < data.length; i += RGBA_STRIDE) {
        if (data[i + RGBA_ALPHA_OFFSET] < ALPHA_CUTOFF) {
            out[i] = BYTE_FULL;
            out[i + 1] = 0x00;
            out[i + 2] = BYTE_FULL;
            out[i + RGBA_ALPHA_OFFSET] = BYTE_FULL;
            continue;
        }
        out[i] = data[i];
        out[i + 1] = data[i + 1];
        out[i + 2] = data[i + 2];
        out[i + RGBA_ALPHA_OFFSET] = BYTE_FULL;
    }
    return out;
}
