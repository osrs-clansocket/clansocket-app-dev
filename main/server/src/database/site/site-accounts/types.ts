export type { OAuthProvider, ProviderRow, OAuthLink } from "./oauth-types.js";
export { LinkConflict, buildOAuthLink } from "./oauth-types.js";

export const SITE_ACCOUNT_COLUMNS =
    "id, provider, provider_user_id, display_name, avatar_url, created_at, last_login_at";

export type SiteAccountProvider = "github" | "discord" | "passkey";

export interface SiteAccountRow {
    id: string;
    provider: SiteAccountProvider;
    provider_user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: number;
    last_login_at: number | null;
}

export interface AccountUpsertArgs {
    provider: SiteAccountProvider;
    providerUserId: string;
    displayName?: string | null;
    avatarUrl?: string | null;
}
