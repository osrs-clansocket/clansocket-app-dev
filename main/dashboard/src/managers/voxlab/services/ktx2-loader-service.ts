import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import type { Texture, WebGLRenderer } from "three";

const TRANSCODER_PATH = "/basis/";

let loader: KTX2Loader | null = null;
let detectionApplied = false;

function ensureLoader(renderer: WebGLRenderer): KTX2Loader {
    if (loader !== null) {
        if (!detectionApplied) {
            loader.detectSupport(renderer);
            detectionApplied = true;
        }
        return loader;
    }
    const l = new KTX2Loader();
    l.setTranscoderPath(TRANSCODER_PATH);
    l.detectSupport(renderer);
    detectionApplied = true;
    loader = l;
    return l;
}

export async function loadKtx2Texture(url: string, renderer: WebGLRenderer): Promise<Texture> {
    const l = ensureLoader(renderer);
    return new Promise<Texture>((resolve, reject) => {
        l.load(
            url,
            (texture) => resolve(texture),
            undefined,
            (err) => reject(err instanceof Error ? err : new Error(String(err))),
        );
    });
}

export function disposeKtx2Loader(): void {
    if (loader !== null) {
        loader.dispose();
        loader = null;
        detectionApplied = false;
    }
}
