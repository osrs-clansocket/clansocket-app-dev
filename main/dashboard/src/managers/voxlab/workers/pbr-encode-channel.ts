import { bytesToBase64 } from "./pbr-encode-base64.js";
import type { ChannelJob } from "./encode-job-types.js";
import type { ChannelResult } from "./encode-result-types.js";

export async function encodeChannel(ch: ChannelJob): Promise<ChannelResult> {
    const imageData = new ImageData(ch.data as Uint8ClampedArray<ArrayBuffer>, ch.width, ch.height);
    const canvas = new OffscreenCanvas(ch.width, ch.height);
    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error(`OffscreenCanvas 2d context unavailable (${ch.width}x${ch.height})`);
    ctx.putImageData(imageData, 0, 0);
    const blob = await canvas.convertToBlob({ type: "image/png" });
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const base64 = bytesToBase64(bytes);
    return { slot: ch.slot, dataURL: `data:image/png;base64,${base64}` };
}
