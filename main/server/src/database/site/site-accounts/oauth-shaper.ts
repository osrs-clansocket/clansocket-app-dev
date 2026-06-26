import type { OAuthLink, OAuthProvider } from "./oauth-types.js";

export function oauthShape(
    provider: OAuthProvider,
    providerUserId: string,
    displayName: string | null,
    avatarUrl: string | null,
): OAuthLink {
    return { provider, providerUserId, displayName, avatarUrl };
}
