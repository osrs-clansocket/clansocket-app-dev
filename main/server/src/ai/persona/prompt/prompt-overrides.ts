export { applyOverrides } from "./overrides-applier.js";

const MODE_EXCLUSIONS: Readonly<Record<string, readonly string[]>> = {
    mode_dashboard_actions: ["action", "action-schema", "dom-action-feedback"],
    mode_op_action: ["action", "action-schema", "dom-action-feedback"],
    mode_op_guide: ["guide"],
    mode_op_tracker: ["tracker"],
};

const PERSONALITY_BLANKS: Readonly<Record<string, readonly string[]>> = {
    mode_banter: ["ai_shittalk_doctrine"],
    mode_inside_jokes: ["ai_inside_jokes"],
    mode_spontaneous_reactions: ["ai_reaction_calibration"],
};

function forModesOff(
    modes: Record<string, boolean>,
    table: Readonly<Record<string, readonly string[]>>,
    fn: (item: string) => void,
): void {
    for (const [modeKey, items] of Object.entries(table)) {
        if (modes[modeKey] !== false) continue;
        for (const item of items) fn(item);
    }
}

export function excludedIds(modes: Record<string, boolean>): Set<string> {
    const excluded = new Set<string>();
    forModesOff(modes, MODE_EXCLUSIONS, (id) => excluded.add(id));
    return excluded;
}

export function applyPersonalityBlanks(modes: Record<string, boolean>): Record<string, string> {
    const blanks: Record<string, string> = {};
    forModesOff(modes, PERSONALITY_BLANKS, (slotKey) => {
        blanks[`__${slotKey}__`] = "";
    });
    return blanks;
}
