import { randomUUID } from "node:crypto";
import { getDb, DB_NAMES, clanRelPath } from "../core/database.js";
import { getOne, execMutation } from "../core/db-ops.js";
import { rsnByHash } from "../plugin/rsn-lookup.js";
import { slugify } from "./clan-slug.js";

export { slugify } from "./clan-slug.js";

const UNCLAIMED_PREFIX = "__unclaimed-";
const SLUG_RANDOM_SUFFIX_LEN = 6;

export type ClanStatus = "unclaimed" | "pending" | "active" | "recovery" | "archived";

export type ClanIconKind = "builtin" | "image" | "voxlab";

export interface ClanRow {
    id: string;
    slug: string;
    display_name: string;
    status: ClanStatus;
    owner_account_hash: string | null;
    owner_site_account_id: string | null;
    dir_path: string;
    created_at: number;
    claimed_at: number | null;
    archived_at: number | null;
    icon_kind: ClanIconKind | null;
    icon_value: string | null;
    color: string | null;
}

export interface ProvisionClanArgs {
    displayName: string;
    slug?: string;
    status?: ClanStatus;
    ownerAccountHash?: string | null;
    ownerSiteAccountId?: string | null;
    id?: string;
}

interface ResolvedProvisionFields {
    id: string;
    slug: string;
    status: ClanStatus;
    claimedAt: number | null;
    dirPath: string;
    ownerHash: string | null;
    ownerRsn: string | null;
    now: number;
}

function resolveProvisionFields(args: ProvisionClanArgs): ResolvedProvisionFields {
    const id = args.id ?? randomUUID();
    const status = args.status ?? "unclaimed";
    const slug =
        args.slug ??
        `${UNCLAIMED_PREFIX}${slugify(args.displayName)}-${randomUUID().split("-").join("").slice(0, SLUG_RANDOM_SUFFIX_LEN)}`;
    const now = Date.now();
    const ownerHash = args.ownerAccountHash ?? null;
    return {
        id,
        slug,
        status,
        now,
        ownerHash,
        claimedAt: status === "active" ? now : null,
        dirPath: clanRelPath(id),
        ownerRsn: ownerHash ? rsnByHash(ownerHash) : null,
    };
}

const PROVISION_CLAN_SQL = `INSERT INTO clansocket_clans (id, slug, display_name, status, owner_account_hash, owner_rsn, owner_site_account_id, dir_path, created_at, claimed_at)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function buildClanRow(f: ResolvedProvisionFields, args: ProvisionClanArgs): ClanRow {
    return {
        id: f.id,
        slug: f.slug,
        status: f.status,
        display_name: args.displayName,
        owner_account_hash: args.ownerAccountHash ?? null,
        owner_site_account_id: args.ownerSiteAccountId ?? null,
        dir_path: f.dirPath,
        created_at: f.now,
        claimed_at: f.claimedAt,
        archived_at: null,
        icon_kind: null,
        icon_value: null,
        color: null,
    };
}

export function provisionClan(args: ProvisionClanArgs): ClanRow {
    const f = resolveProvisionFields(args);
    execMutation(
        getDb(DB_NAMES.APP),
        PROVISION_CLAN_SQL,
        f.id,
        f.slug,
        args.displayName,
        f.status,
        f.ownerHash,
        f.ownerRsn,
        args.ownerSiteAccountId ?? null,
        f.dirPath,
        f.now,
        f.claimedAt,
    );
    return buildClanRow(f, args);
}

const CLAN_COLUMNS =
    "id, slug, display_name, status, owner_account_hash, owner_site_account_id, dir_path, created_at, claimed_at, archived_at, icon_kind, icon_value, color";

export function clanByName(displayName: string): ClanRow | null {
    return getOne<ClanRow>(
        getDb(DB_NAMES.APP),
        `SELECT ${CLAN_COLUMNS}
         FROM clansocket_clans WHERE LOWER(display_name) = LOWER(?) AND archived_at IS NULL
         ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'pending' THEN 1 WHEN 'recovery' THEN 2 ELSE 3 END,
                  created_at DESC LIMIT 1`,
        displayName,
    );
}

export function clanById(id: string): ClanRow | null {
    return getOne<ClanRow>(getDb(DB_NAMES.APP), `SELECT ${CLAN_COLUMNS} FROM clansocket_clans WHERE id = ?`, id);
}

export function clanBySlug(slug: string): ClanRow | null {
    return getOne<ClanRow>(getDb(DB_NAMES.APP), `SELECT ${CLAN_COLUMNS} FROM clansocket_clans WHERE slug = ?`, slug);
}

export function orCreateClan(displayName: string): ClanRow {
    const existing = clanByName(displayName);
    if (existing) return existing;
    return provisionClan({ displayName, status: "unclaimed" });
}

export function countClans(): number {
    const db = getDb(DB_NAMES.APP);
    return (db.prepare("SELECT COUNT(*) AS c FROM clansocket_clans").get() as { c: number }).c;
}
