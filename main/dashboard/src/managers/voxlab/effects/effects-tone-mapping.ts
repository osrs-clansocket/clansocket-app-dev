import {
    ACESFilmicToneMapping,
    AgXToneMapping,
    CineonToneMapping,
    LinearToneMapping,
    NoToneMapping,
    ReinhardToneMapping,
    type ToneMapping,
} from "three";
import type { ToneMappingMode } from "../../../shared/types/voxlab/effects-types.js";

export const TONE_MAPPING_MAP: Record<ToneMappingMode, ToneMapping> = {
    none: NoToneMapping,
    linear: LinearToneMapping,
    reinhard: ReinhardToneMapping,
    cineon: CineonToneMapping,
    aces: ACESFilmicToneMapping,
    agx: AgXToneMapping,
};
