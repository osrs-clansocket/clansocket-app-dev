import { randomUUID } from "node:crypto";
import { DB_NAMES, getDb } from "../../core/database.js";
import { execMutation } from "../../core/db-ops.js";
import { accountById } from "./account-crud.js";
import { oAuthLink } from "./oauth-link.js";
import type { OAuthLink, SiteAccountRow } from "./types.js";

function refreshAccount(
    db: ReturnType<typeof getDb>,
    existingId: string,
    args: OAuthLink,
    now: number,
): SiteAccountRow | null {
    execMutation(db, `UPDATE clansocket_accounts SET last_login_at = ? WHERE id = ?`, now, existingId);
    execMutation(
        db,
        `UPDATE clansocket_account_providers SET display_name = COALESCE(?, display_name), avatar_url = COALESCE(?, avatar_url) WHERE provider = ? AND provider_user_id = ?`,
        args.displayName ?? null,
        args.avatarUrl ?? null,
        args.provider,
        args.providerUserId,
    );
    return accountById(existingId);
}

function insertAccountRows(db: ReturnType<typeof getDb>, id: string, args: OAuthLink, now: number): void {
    execMutation(
        db,
        `INSERT INTO clansocket_accounts (id, provider, provider_user_id, display_name, avatar_url, created_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id,
        args.provider,
        args.providerUserId,
        args.displayName ?? null,
        args.avatarUrl ?? null,
        now,
        now,
    );
    execMutation(
        db,
        `INSERT INTO clansocket_account_providers (site_account_id, provider, provider_user_id, display_name, avatar_url, linked_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        id,
        args.provider,
        args.providerUserId,
        args.displayName ?? null,
        args.avatarUrl ?? null,
        now,
    );
}

function createAccount(db: ReturnType<typeof getDb>, args: OAuthLink, now: number): SiteAccountRow {
    const id = randomUUID();
    insertAccountRows(db, id, args, now);
    return {
        id,
        provider: args.provider,
        provider_user_id: args.providerUserId,
        display_name: args.displayName ?? null,
        avatar_url: args.avatarUrl ?? null,
        created_at: now,
        last_login_at: now,
    };
}

export function resolveAccount(args: OAuthLink): SiteAccountRow {
    const db = getDb(DB_NAMES.APP);
    const now = Date.now();
    const existingId = oAuthLink(args.provider, args.providerUserId);
    if (existingId !== null) {
        const refreshed = refreshAccount(db, existingId, args, now);
        if (refreshed) return refreshed;
    }
    return createAccount(db, args, now);
}
