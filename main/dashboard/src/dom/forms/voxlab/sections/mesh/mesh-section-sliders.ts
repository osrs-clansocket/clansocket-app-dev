import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import { buildSmoothingTrio } from "./mesh-smoothing-sliders.js";
import { buildTaubinPair } from "./mesh-taubin-sliders.js";

type Slider = ReturnType<typeof createSliderInput>;

export interface MeshSliderSet {
    smoothingRounds: Slider;
    cornerAngle: Slider;
    scale: Slider;
    taubinLambda: Slider;
    taubinMu: Slider;
}

export function buildMeshSliders(): MeshSliderSet {
    return { ...buildSmoothingTrio(), ...buildTaubinPair() };
}
