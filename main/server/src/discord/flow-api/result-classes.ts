export const STRUCTURAL_RESULT_CLASSES: readonly string[] = ["queued", "permission_denied", "not_found"];

export const SEND_RESULT_CLASSES: readonly string[] = ["sent", "rate_limit", "permission_denied", "channel_not_found"];

export const MESSAGE_OP_RESULT_CLASSES: readonly string[] = [
    "sent",
    "rate_limit",
    "permission_denied",
    "channel_not_found",
    "bot_missing_in_guild",
];

export const MEMBER_RESULT_CLASSES: readonly string[] = [
    "queued",
    "permission_denied",
    "member_not_found",
    "guild_not_found",
];
