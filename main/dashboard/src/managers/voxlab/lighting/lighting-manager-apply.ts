import type { Color, DirectionalLight, HemisphereLight } from "three";
import type {
    BottomLightSettings,
    HemisphereSettings,
    RimLightSettings,
    TopLightSettings,
} from "../../../shared/types/voxlab/light-types.js";

const TOP_LIGHT_POSITION: readonly [number, number, number] = [0, 6, 0.5];
const BOTTOM_LIGHT_POSITION: readonly [number, number, number] = [0, -4, 0.5];

export function applyHemisphere(hemi: HemisphereLight, hemiSky: Color, hemiGround: Color, s: HemisphereSettings): void {
    hemiSky.set(s.skyColor);
    hemiGround.set(s.groundColor);
    hemi.color = hemiSky;
    hemi.groundColor = hemiGround;
    hemi.intensity = s.intensity;
}

export function applyRim(rim: DirectionalLight, rimColor: Color, s: RimLightSettings): void {
    rim.intensity = s.intensity;
    rimColor.set(s.color);
    rim.color = rimColor;
    rim.position.set(s.positionX, s.positionY, s.positionZ);
}

export function applyTop(top: DirectionalLight, topColor: Color, s: TopLightSettings): void {
    top.intensity = s.intensity;
    topColor.set(s.color);
    top.color = topColor;
    top.position.set(TOP_LIGHT_POSITION[0], TOP_LIGHT_POSITION[1], TOP_LIGHT_POSITION[2]);
}

export function applyBottom(bottom: DirectionalLight, bottomColor: Color, s: BottomLightSettings): void {
    bottom.intensity = s.intensity;
    bottomColor.set(s.color);
    bottom.color = bottomColor;
    bottom.position.set(BOTTOM_LIGHT_POSITION[0], BOTTOM_LIGHT_POSITION[1], BOTTOM_LIGHT_POSITION[2]);
}
