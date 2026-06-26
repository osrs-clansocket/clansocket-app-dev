const DISCORD_PERMISSIONS = Object.freeze({
    ADMINISTRATOR: "Administrator",
    MANAGE_GUILD: "ManageGuild",
    MANAGE_CHANNELS: "ManageChannels",
    MANAGE_MESSAGES: "ManageMessages",
    MANAGE_ROLES: "ManageRoles",
    KICK_MEMBERS: "KickMembers",
    BAN_MEMBERS: "BanMembers",
    SEND_MESSAGES: "SendMessages",
    VIEW_CHANNEL: "ViewChannel",
    READ_MESSAGE_HISTORY: "ReadMessageHistory",
});

const AUDIT_ACTIONS = Object.freeze({
    COMMAND_EXECUTED: "command_executed",
    PERMISSION_DENIED: "permission_denied",
    RATE_LIMITED: "rate_limited",
    ERROR_OCCURRED: "error_occurred",
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    SERVER_ADDED: "server_added",
    SERVER_REMOVED: "server_removed",
});

const LOG_LEVELS = Object.freeze({
    ERROR: "error",
    WARN: "warn",
    INFO: "info",
    DEBUG: "debug",
});

const COMMAND_PREFIXES = Object.freeze({
    DEFAULT: "!",
    ADMIN: "!!",
    DEBUG: "?",
});

const EPHEMERAL = 64;
const MS_PER_SECOND = 1000;
const SECONDS_30_MS = 30000;

const FALLBACK_UNKNOWN = "unknown";
const HTTP_METHOD_POST = "POST";
const HTTP_STATUS_OK = 200;

const OVERWRITE_KIND = Object.freeze({
    ROLE: "role",
    MEMBER: "member",
});

const STATE_KINDS = Object.freeze({
    CHANNELS: "channels",
    MEMBERS: "members",
    ROLES: "roles",
    SERVER_EMOJIS: "server-emojis",
    SERVER_STICKERS: "server-stickers",
});

const HANDLER_MESSAGES = Object.freeze({
    RATE_LIMITED_PREFIX: "Rate limited. Try again in ",
    RATE_LIMITED_SUFFIX: " seconds.",
    COMMAND_ERROR: "An error occurred while processing your command.",
    INTERACTION_ERROR: "An error occurred while processing your interaction.",
    PERMISSION_DENIED: "You do not have permission to use this command.",
    UNKNOWN_COMMAND: "Unknown command.",
});

export {
    AUDIT_ACTIONS,
    COMMAND_PREFIXES,
    DISCORD_PERMISSIONS,
    EPHEMERAL,
    FALLBACK_UNKNOWN,
    HANDLER_MESSAGES,
    HTTP_METHOD_POST,
    HTTP_STATUS_OK,
    LOG_LEVELS,
    MS_PER_SECOND,
    OVERWRITE_KIND,
    SECONDS_30_MS,
    STATE_KINDS,
};
