import type { SceneSnapshot } from "../../../../types/voxlab/snapshot-types.js";
import { readNumber } from "./preset-snapshot-readers.js";

export interface OrbitState {
    cx: number;
    cy: number;
    cz: number;
    tx: number;
    ty: number;
    tz: number;
    radius: number;
    phase0: number;
}

export function orbitState(snap: SceneSnapshot): OrbitState {
    const cx = readNumber(snap, "camera", "positionX", 1.3);
    const cy = readNumber(snap, "camera", "positionY", 0.9);
    const cz = readNumber(snap, "camera", "positionZ", 1.6);
    const tx = readNumber(snap, "camera", "targetX", 0);
    const ty = readNumber(snap, "camera", "targetY", 0);
    const tz = readNumber(snap, "camera", "targetZ", 0);
    const dx = cx - tx;
    const dz = cz - tz;
    return { cx, cy, cz, tx, ty, tz, radius: Math.sqrt(dx * dx + dz * dz), phase0: Math.atan2(dz, dx) };
}
