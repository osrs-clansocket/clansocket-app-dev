import type { CaptureBuffer } from "../../managers/voxlab/services/capture-service.js";

export type FrameConsumer = (frameIndex: number, pixels: CaptureBuffer, timeMs: number) => Promise<void> | void;
