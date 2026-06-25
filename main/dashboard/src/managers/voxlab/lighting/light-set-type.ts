import type { AmbientLight, DirectionalLight, HemisphereLight } from "three";

export interface LightSet {
    ambient: AmbientLight;
    key: DirectionalLight;
    fill: DirectionalLight;
    rim: DirectionalLight;
    top: DirectionalLight;
    bottom: DirectionalLight;
    hemi: HemisphereLight;
}
