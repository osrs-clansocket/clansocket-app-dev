import { PMREMGenerator, type Texture, type WebGLRenderer } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export interface PmremKit {
    pmrem: PMREMGenerator;
    proceduralEnv: Texture;
}

export interface PmremCache {
    get(k: WebGLRenderer): PmremKit | undefined;
    set(k: WebGLRenderer, v: PmremKit): void;
}

export function buildPmrem(renderer: WebGLRenderer, cache: PmremCache): PmremKit {
    const cached = cache.get(renderer);
    if (cached) return cached;
    const pmrem = new PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const proceduralEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const kit: PmremKit = { pmrem, proceduralEnv };
    cache.set(renderer, kit);
    return kit;
}
