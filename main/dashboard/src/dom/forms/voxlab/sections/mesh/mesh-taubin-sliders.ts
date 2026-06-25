import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    DEFAULT_MESH_SETTINGS,
    TAUBIN_LAMBDA_MAX,
    TAUBIN_LAMBDA_MIN,
    TAUBIN_MU_MAX,
    TAUBIN_MU_MIN,
} from "../../../../../shared/constants/voxlab/mesh-settings-constants.js";
import { STEP_HUNDREDTH } from "../../../../../shared/constants/voxlab/slider-step-constants.js";

const FRACTION_TWO = 2;

type Slider = ReturnType<typeof createSliderInput>;

export function buildTaubinPair(): { taubinLambda: Slider; taubinMu: Slider } {
    return {
        taubinLambda: createSliderInput({
            label: "Taubin λ (smooth)",
            min: TAUBIN_LAMBDA_MIN,
            max: TAUBIN_LAMBDA_MAX,
            step: STEP_HUNDREDTH,
            value: DEFAULT_MESH_SETTINGS.taubinLambda,
            formatValue: (n) => n.toFixed(FRACTION_TWO),
        }),
        taubinMu: createSliderInput({
            label: "Taubin μ (inflate)",
            min: TAUBIN_MU_MIN,
            max: TAUBIN_MU_MAX,
            step: STEP_HUNDREDTH,
            value: DEFAULT_MESH_SETTINGS.taubinMu,
            formatValue: (n) => n.toFixed(FRACTION_TWO),
        }),
    };
}
