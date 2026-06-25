import { readbackTexture as _readbackTexture } from "./pbr-shader-readback.js";
export const readbackTexture = _readbackTexture;
import type {
    PbrChannelConfig as _PbrChannelConfig,
    PbrChannelResult as _PbrChannelResult,
    PbrGenResult as _PbrGenResult,
} from "./pbr-shader-types.js";
export type PbrChannelConfig = _PbrChannelConfig;
export type PbrChannelResult = _PbrChannelResult;
export type PbrGenResult = _PbrGenResult;
import { uploadSource as _uploadSource } from "./pbr-shader-upload.js";
export const uploadSource = _uploadSource;
import { setSlotUniforms as _setSlotUniforms } from "./shader-slot-uniforms.js";
export const setSlotUniforms = _setSlotUniforms;
