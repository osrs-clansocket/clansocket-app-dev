import { readNumber as _readNumber, readString as _readString } from "./utils/preset-snapshot-readers.js";
export const readNumber = _readNumber;
export const readString = _readString;
import { OrbitState as _OrbitState, orbitState as _orbitState } from "./utils/preset-orbit-state.js";
export type OrbitState = _OrbitState;
export const orbitState = _orbitState;
import { sample as _sample, sampleColor as _sampleColor, track as _track } from "./utils/preset-sample.js";
export const sample = _sample;
export const sampleColor = _sampleColor;
export const track = _track;
import { hslHex as _hslHex } from "./utils/preset-hsl-hex.js";
export const hslHex = _hslHex;
import { lerpHex as _lerpHex } from "./utils/preset-hex-interp.js";
export const lerpHex = _lerpHex;
import { halfOrbitTracks as _halfOrbitTracks } from "./utils/preset-half-orbit.js";
export const halfOrbitTracks = _halfOrbitTracks;

export function numberTrack(
    property: string,
    durationMs: number,
    steps: number,
    fn: (u: number) => number,
): ReturnType<typeof _track> {
    return _track(property, "number", _sample(durationMs, steps, fn));
}

export function cameraAxisTrack(
    axis: "X" | "Y" | "Z",
    durationMs: number,
    steps: number,
    fn: (u: number) => number,
): ReturnType<typeof _track> {
    return numberTrack(`camera.position${axis}`, durationMs, steps, fn);
}
