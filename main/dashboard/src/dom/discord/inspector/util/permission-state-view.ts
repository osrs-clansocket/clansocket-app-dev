import {
    PERMISSION_STATE_ALLOW,
    PERMISSION_STATE_DENY,
    PERMISSION_STATE_INHERIT,
} from "../../../../shared/constants/clan-manage-discord/permission-flags-constants.js";

const STATE_ICON: Record<string, string> = {
    [PERMISSION_STATE_ALLOW]: "check-lg",
    [PERMISSION_STATE_DENY]: "x-lg",
    [PERMISSION_STATE_INHERIT]: "dash",
};

const FALLBACK_ICON = "dash";

export function iconForState(state: string): string {
    return STATE_ICON[state] ?? FALLBACK_ICON;
}

const STATE_MODIFIER: Record<string, string> = {
    [PERMISSION_STATE_ALLOW]: "allow",
    [PERMISSION_STATE_DENY]: "deny",
    [PERMISSION_STATE_INHERIT]: "inherit",
};

const FALLBACK_MODIFIER = "inherit";

export function modifierForState(state: string): string {
    return STATE_MODIFIER[state] ?? FALLBACK_MODIFIER;
}
