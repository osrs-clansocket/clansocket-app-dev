import { ClampToEdgeWrapping, DataTexture, LinearFilter, RGBAFormat, UnsignedByteType } from "three";

export function uploadSource(source: ImageData, existing: DataTexture | null): DataTexture {
    const w = source.width;
    const h = source.height;
    const view = new Uint8Array(source.data.buffer, source.data.byteOffset, source.data.byteLength);
    if (existing !== null && existing.image.width === w && existing.image.height === h) {
        existing.image.data = view;
        existing.needsUpdate = true;
        return existing;
    }
    if (existing !== null) existing.dispose();
    const tex = new DataTexture(view, w, h, RGBAFormat, UnsignedByteType);
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.wrapS = ClampToEdgeWrapping;
    tex.wrapT = ClampToEdgeWrapping;
    tex.flipY = true;
    tex.needsUpdate = true;
    return tex;
}
