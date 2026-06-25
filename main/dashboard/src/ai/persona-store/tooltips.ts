import type { Tooltip } from "../../shared/types/tooltip-types.js";
import { TOOLTIPS_RUNTIME } from "./tooltips-runtime.js";
import { TOOLTIPS_VOICE } from "./tooltips-voice.js";

export const TOOLTIPS: Readonly<Record<string, Tooltip>> = {
    ...TOOLTIPS_VOICE,
    ...TOOLTIPS_RUNTIME,
};
