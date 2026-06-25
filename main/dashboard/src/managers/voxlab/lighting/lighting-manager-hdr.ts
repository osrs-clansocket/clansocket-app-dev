import type { PMREMGenerator, Texture } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export async function loadHdrTexture(pmrem: PMREMGenerator, buffer: ArrayBuffer): Promise<Texture> {
    const loader = new RGBELoader();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    try {
        const tex = await loader.loadAsync(url);
        const pmremTex = pmrem.fromEquirectangular(tex).texture;
        tex.dispose();
        return pmremTex;
    } finally {
        URL.revokeObjectURL(url);
    }
}
