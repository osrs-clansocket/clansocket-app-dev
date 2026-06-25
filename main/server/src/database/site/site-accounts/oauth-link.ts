import { DB_NAMES, getDb } from "../../core/database.js";
import { execMutation, getMany, getOne, runMutation } from "../../core/db-ops.js";
import { LinkConflict, type OAuthLink, type OAuthProvider, type ProviderRow } from "./types.js";

export { resolveAccount } from "./oauth-account-resolver.js";

export function oAuthLink(provider: OAuthProvider, providerUserId: string): string | null {
    const row = getOne<{ site_account_id: string }>(
        getDb(DB_NAMES.APP),
        `SELECT site_account_id FROM clansocket_account_providers WHERE provider = ? AND provider_user_id = ?`,
        provider,
        providerUserId,
    );
    return row ? row.site_account_id : null;
}

export function listProvidersAccount(siteAccountId: string): ProviderRow[] {
    return getMany<ProviderRow>(
        getDb(DB_NAMES.APP),
        `SELECT site_account_id, provider, provider_user_id, display_name, avatar_url, linked_at
         FROM clansocket_account_providers WHERE site_account_id = ? ORDER BY linked_at ASC`,
        siteAccountId,
    );
}

function updateProviderRow(db: ReturnType<typeof getDb>, siteAccountId: string, args: OAuthLink): void {
    execMutation(
        db,
        `UPDATE clansocket_account_providers SET display_name = ?, avatar_url = ?, linked_at = ?
         WHERE site_account_id = ? AND provider = ?`,
        args.displayName ?? null,
        args.avatarUrl ?? null,
        Date.now(),
        siteAccountId,
        args.provider,
    );
}

function insertProviderRow(db: ReturnType<typeof getDb>, siteAccountId: string, args: OAuthLink): void {
    execMutation(
        db,
        `INSERT INTO clansocket_account_providers
            (site_account_id, provider, provider_user_id, display_name, avatar_url, linked_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        siteAccountId,
        args.provider,
        args.providerUserId,
        args.displayName ?? null,
        args.avatarUrl ?? null,
        Date.now(),
    );
}

function persistLink(
    db: ReturnType<typeof getDb>,
    siteAccountId: string,
    args: OAuthLink,
    existing: string | null,
): void {
    const already = getOne<{ site_account_id: string }>(
        db,
        `SELECT site_account_id FROM clansocket_account_providers WHERE site_account_id = ? AND provider = ?`,
        siteAccountId,
        args.provider,
    );
    if (already && existing === siteAccountId) {
        updateProviderRow(db, siteAccountId, args);
        return;
    }
    if (already) throw new LinkConflict("account_already_has_provider");
    insertProviderRow(db, siteAccountId, args);
}

export function linkAccount(siteAccountId: string, args: OAuthLink): ProviderRow {
    const db = getDb(DB_NAMES.APP);
    const existing = oAuthLink(args.provider, args.providerUserId);
    if (existing !== null && existing !== siteAccountId) {
        throw new LinkConflict("provider_already_linked_elsewhere");
    }
    persistLink(db, siteAccountId, args, existing);
    return {
        site_account_id: siteAccountId,
        provider: args.provider,
        provider_user_id: args.providerUserId,
        display_name: args.displayName ?? null,
        avatar_url: args.avatarUrl ?? null,
        linked_at: Date.now(),
    };
}

export function unlinkProvider(siteAccountId: string, provider: OAuthProvider): boolean {
    return runMutation(
        getDb(DB_NAMES.APP),
        `DELETE FROM clansocket_account_providers WHERE site_account_id = ? AND provider = ?`,
        siteAccountId,
        provider,
    );
}
