import { AmbientLight, DirectionalLight, HemisphereLight, type Color } from "three";
import {
    DEFAULT_BOTTOM_LIGHT,
    DEFAULT_HEMISPHERE,
    DEFAULT_LIGHTING,
    DEFAULT_RIM_LIGHT,
    DEFAULT_TOP_LIGHT,
} from "../../../shared/constants/voxlab/lighting/light-constants.js";
import { configureKeyShadow } from "./lighting-key-shadow.js";
import type { LightSet } from "./light-set-type.js";

export type { LightSet } from "./light-set-type.js";

const WHITE_HEX = 0xffffff;

export function buildLights(colors: { fill: Color; rim: Color; top: Color; bottom: Color }): LightSet {
    const ambient = new AmbientLight(WHITE_HEX, DEFAULT_LIGHTING.ambientIntensity);
    const key = new DirectionalLight(WHITE_HEX, DEFAULT_LIGHTING.keyIntensity);
    configureKeyShadow(key);
    const fill = new DirectionalLight(colors.fill, DEFAULT_LIGHTING.fillIntensity);
    const rim = new DirectionalLight(colors.rim, DEFAULT_RIM_LIGHT.intensity);
    const top = new DirectionalLight(colors.top, DEFAULT_TOP_LIGHT.intensity);
    const bottom = new DirectionalLight(colors.bottom, DEFAULT_BOTTOM_LIGHT.intensity);
    const hemi = new HemisphereLight(WHITE_HEX, WHITE_HEX, DEFAULT_HEMISPHERE.intensity);
    return { ambient, key, fill, rim, top, bottom, hemi };
}
