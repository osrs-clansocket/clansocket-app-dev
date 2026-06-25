import type { Actions } from "../../../types.js";

function isOff(modes: Record<string, boolean> | undefined, key: string): boolean {
    return modes !== undefined && modes[key] === false;
}

export function applyModeGates(
    input: {
        parsedActions: Actions | null;
        parsedProfileContext: Record<string, unknown> | null;
        parsedSuggestedUserResponse: string | null;
    },
    modes: Record<string, boolean> | undefined,
): {
    actions: Actions | null;
    profileContext: Record<string, unknown> | null;
    suggestedUserResponse: string | null;
} {
    return {
        actions: isOff(modes, "mode_dashboard_actions") || isOff(modes, "mode_op_action") ? null : input.parsedActions,
        profileContext: isOff(modes, "mode_profile_updates") ? null : input.parsedProfileContext,
        suggestedUserResponse: isOff(modes, "mode_suggested_replies") ? null : input.parsedSuggestedUserResponse,
    };
}
