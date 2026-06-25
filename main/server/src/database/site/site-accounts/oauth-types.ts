export { LinkConflict } from "./link-conflict.js";

export type OAuthProvider = "github" | "discord";

export interface ProviderRow {
    site_account_id: string;
    provider: OAuthProvider;
    provider_user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    linked_at: number;
}

export interface OAuthLink {
    provider: OAuthProvider;
    providerUserId: string;
    displayName?: string | null;
    avatarUrl?: string | null;
}

export function buildOAuthLink(
    provider: OAuthProvider,
    providerUserId: string,
    displayName: string | null,
    avatarUrl: string | null,
): OAuthLink {
    return { provider, providerUserId, displayName, avatarUrl };
}
