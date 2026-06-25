import type { AmbientLight, DirectionalLight, HemisphereLight, Scene } from "three";
import type { EnvRefs } from "./env-types.js";

export interface LightingDisposeRefs {
    scene: Scene;
    refs: EnvRefs;
    ambient: AmbientLight;
    key: DirectionalLight;
    fill: DirectionalLight;
    rim: DirectionalLight;
    top: DirectionalLight;
    bottom: DirectionalLight;
    hemi: HemisphereLight;
}

export function disposeLighting(r: LightingDisposeRefs): void {
    r.scene.environment = null;
    if (r.refs.uploadedEnv.v) {
        r.refs.uploadedEnv.v.dispose();
        r.refs.uploadedEnv.v = null;
    }
    if (r.key.shadow.map !== null) {
        r.key.shadow.map.dispose();
        r.key.shadow.map = null;
    }
    for (const light of [r.ambient, r.key, r.fill, r.rim, r.top, r.bottom, r.hemi]) {
        // eslint-disable-next-line lvi/no-raw-dom -- three.js Scene.remove, not DOM
        r.scene.remove(light);
    }
}
