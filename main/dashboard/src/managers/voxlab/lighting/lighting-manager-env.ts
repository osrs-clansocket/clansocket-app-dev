import { loadHdrTexture } from "./lighting-manager-hdr.js";
import type { EnvDeps } from "./env-types.js";
import { refreshSceneEnvironment } from "./env-refresh.js";

export type { EnvRefs, EnvDeps } from "./env-types.js";
export { refreshSceneEnvironment } from "./env-refresh.js";

export async function loadHdrInto(deps: EnvDeps, buffer: ArrayBuffer, name: string): Promise<void> {
    deps.refs.hdrLoadEpoch.v++;
    const epoch = deps.refs.hdrLoadEpoch.v;
    const pmremTex = await loadHdrTexture(deps.pmrem, buffer);
    if (epoch !== deps.refs.hdrLoadEpoch.v) {
        pmremTex.dispose();
        return;
    }
    if (deps.refs.uploadedEnv.v) deps.refs.uploadedEnv.v.dispose();
    deps.refs.uploadedEnv.v = pmremTex;
    deps.refs.uploadedHdrName.v = name;
    refreshSceneEnvironment(deps);
}

export function clearHdrFrom(deps: EnvDeps): void {
    deps.refs.hdrLoadEpoch.v++;
    if (deps.refs.uploadedEnv.v) {
        deps.refs.uploadedEnv.v.dispose();
        deps.refs.uploadedEnv.v = null;
    }
    deps.refs.uploadedHdrName.v = null;
    refreshSceneEnvironment(deps);
}
