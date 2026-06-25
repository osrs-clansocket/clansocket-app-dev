import { createHash, randomBytes } from "node:crypto";
import { DB_NAMES, getDb } from "../../database/index.js";
import { encodeBytes, formatHumanReadable } from "./human-readable-code.js";

export { redeemBackupCode } from "./redeem-backup-code.js";

const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LEN = 16;

export interface BackupCodeMeta {
    generatedAt: number;
    totalCount: number;
    remainingCount: number;
}

function hashCode(code: string): string {
    return createHash("sha256").update(code.replaceAll("-", "").toUpperCase()).digest("hex");
}

function generateOneCode(): string {
    return formatHumanReadable(encodeBytes(randomBytes(BACKUP_CODE_LEN)).slice(0, BACKUP_CODE_LEN));
}

interface StoreCodeArgs {
    db: ReturnType<typeof getDb>;
    siteAccountId: string;
    hash: string;
    now: number;
    insertedHashes: Set<string>;
}

function tryStoreCode(args: StoreCodeArgs): boolean {
    const { db, siteAccountId, hash, now, insertedHashes } = args;
    if (insertedHashes.has(hash)) return false;
    try {
        db.prepare(
            `INSERT INTO clansocket_backup_codes (site_account_id, code_hash, generated_at)
             VALUES (?, ?, ?)`,
        ).run(siteAccountId, hash, now);
        insertedHashes.add(hash);
        return true;
    } catch {
        return false;
    }
}

export function generateBackupCodes(siteAccountId: string): string[] {
    const db = getDb(DB_NAMES.APP);
    const now = Date.now();
    const codes: string[] = [];
    const insertedHashes = new Set<string>();

    db.transaction(() => {
        db.prepare(`DELETE FROM clansocket_backup_codes WHERE site_account_id = ?`).run(siteAccountId);
        while (codes.length < BACKUP_CODE_COUNT) {
            const raw = generateOneCode();
            if (tryStoreCode({ db, siteAccountId, now, insertedHashes, hash: hashCode(raw) })) {
                codes.push(raw);
            }
        }
    })();

    return codes;
}

export function backupCodeMeta(siteAccountId: string): BackupCodeMeta | null {
    const db = getDb(DB_NAMES.APP);
    const row = db
        .prepare(
            `SELECT COUNT(*) AS total, SUM(CASE WHEN redeemed_at IS NULL THEN 1 ELSE 0 END) AS remaining,
                    MIN(generated_at) AS generated_at
             FROM clansocket_backup_codes WHERE site_account_id = ?`,
        )
        .get(siteAccountId) as { total: number; remaining: number | null; generated_at: number | null };
    if (row.total === 0) return null;
    return {
        generatedAt: row.generated_at ?? 0,
        totalCount: row.total,
        remainingCount: row.remaining ?? 0,
    };
}
