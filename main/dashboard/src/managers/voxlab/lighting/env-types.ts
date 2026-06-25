import type { PMREMGenerator, Scene, Texture } from "three";

export interface EnvRefs {
    uploadedEnv: { v: Texture | null };
    uploadedHdrName: { v: string | null };
    hdrLoadEpoch: { v: number };
    environmentEnabled: { v: boolean };
    environmentIntensity: { v: number };
}

export interface EnvDeps {
    scene: Scene;
    pmrem: PMREMGenerator;
    proceduralEnv: Texture;
    refs: EnvRefs;
}
