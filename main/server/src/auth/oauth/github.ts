import { buildOauthUrl, oauthExchange, oauthFetchUser } from "./oauth-client.js";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const SCOPES = "read:user";

export interface GithubUser {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string | null;
}

export function buildAuthorizeUrl(clientId: string, state: string, redirectUri: string): string {
    return buildOauthUrl(GITHUB_AUTHORIZE_URL, {
        client_id: clientId,
        redirect_uri: redirectUri,
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
        GITHUB_TOKEN_URL,
        {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
        },
        "github",
    );
}

export function fetchUser(accessToken: string): Promise<GithubUser> {
    return oauthFetchUser<GithubUser>(GITHUB_USER_URL, accessToken, "github", {
        Accept: "application/vnd.github+json",
    });
}
