import type { DataTexture } from "three";
import type { EnvDeps } from "./env-types.js";

export function refreshSceneEnvironment(deps: EnvDeps): void {
    if (!deps.refs.environmentEnabled.v) {
        deps.scene.environment = null;
        deps.scene.environmentIntensity = 0;
        return;
    }
    const tex = deps.refs.uploadedEnv.v ?? deps.proceduralEnv;
    deps.scene.environment = tex as DataTexture | null;
    deps.scene.environmentIntensity = deps.refs.environmentIntensity.v;
}
