import { MAX_STROKE_HISTORY } from "../../../shared/constants/voxlab/texture-paint-constants.js";
import type { StrokeDelta } from "../paint/paint-manager-types.js";

export function pushDelta(state: { strokeHistory: StrokeDelta[]; redoStack: StrokeDelta[] }, delta: StrokeDelta): void {
    state.strokeHistory.push(delta);
    if (state.strokeHistory.length > MAX_STROKE_HISTORY) state.strokeHistory.shift();
    state.redoStack = [];
}
