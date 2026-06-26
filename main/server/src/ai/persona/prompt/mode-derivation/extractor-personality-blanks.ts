import { forModesOff } from "./iterator-modes-off.js";
import { PERSONALITY_BLANKS } from "./mode-tables.js";

export function applyPersonalityBlanks(modes: Record<string, boolean>): Record<string, string> {
    const blanks: Record<string, string> = {};
    forModesOff(modes, PERSONALITY_BLANKS, (slotKey) => {
        blanks[`__${slotKey}__`] = "";
    });
    return blanks;
}
