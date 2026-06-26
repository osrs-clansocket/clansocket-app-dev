export const MODE_EXCLUSIONS: Readonly<Record<string, readonly string[]>> = {
    mode_dashboard_actions: ["action", "action-schema", "dom-action-feedback"],
    mode_op_action: ["action", "action-schema", "dom-action-feedback"],
    mode_op_guide: ["guide"],
    mode_op_tracker: ["tracker"],
};

export const PERSONALITY_BLANKS: Readonly<Record<string, readonly string[]>> = {
    mode_banter: ["ai_shittalk_doctrine"],
    mode_inside_jokes: ["ai_inside_jokes"],
    mode_spontaneous_reactions: ["ai_reaction_calibration"],
};
