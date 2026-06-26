import { forModesOff } from "./iterator-modes-off.js";
import { MODE_EXCLUSIONS } from "./mode-tables.js";

export function excludedIds(modes: Record<string, boolean>): Set<string> {
    const excluded = new Set<string>();
    forModesOff(modes, MODE_EXCLUSIONS, (id) => excluded.add(id));
    return excluded;
}
