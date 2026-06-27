const CLANS_PATH = "/clans";

export const AppRoutes = {
    HOME: "/",
    CLAN: CLANS_PATH,
    CLAN_ROSTER: CLANS_PATH,
    CLAN_MANAGE: CLANS_PATH,
    CLAN_LIVE: CLANS_PATH,
    ACCOUNT: "/account",
    AI_SETTINGS: "/ai-settings",
    DATA_RIGHTS: "/data-rights",
    LOGIN_DEVICE: "/login-device",
    RECOVER: "/recover",
    PRIVACY: "/privacy",
    TERMS: "/terms",
} as const;

export const ROUTE_ENTER_FORWARD = "fx-route-enter-right";
export const ROUTE_ENTER_BACKWARD = "fx-route-enter-left";
