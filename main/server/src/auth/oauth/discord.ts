import { buildOauthUrl, oauthExchange, oauthFetchUser } from "./oauth-client.js";

const DISCORD_AUTHORIZE_URL = "https://discord.com/api/oauth2/authorize";
const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const DISCORD_USER_URL = "https://discord.com/api/users/@me";
const SCOPES = "identify";

export interface DiscordUser {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
}

export function buildAuthorizeUrl(clientId: string, state: string, redirectUri: string): string {
    return buildOauthUrl(DISCORD_AUTHORIZE_URL, {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: SCOPES,
        state,
    });
}

export function exchangeCodeToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string,
): Promise<string> {
    return oauthExchange(
        DISCORD_TOKEN_URL,
        {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
        },
        "discord",
    );
}

export function fetchUser(accessToken: string): Promise<DiscordUser> {
    return oauthFetchUser<DiscordUser>(DISCORD_USER_URL, accessToken, "discord");
}

export function avatarUrl(user: DiscordUser): string | null {
    if (!user.avatar) return null;
    const ext = user.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}`;
}
