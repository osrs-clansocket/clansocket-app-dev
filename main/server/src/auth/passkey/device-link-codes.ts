import logger from "@clansocket/logger";
import { randomInt } from "node:crypto";
import { DB_NAMES, getDb } from "../../database/index.js";
import { MS_PER_MINUTE } from "../../shared/time.js";
import { sweepExpiredRows } from "./sweep-expired.js";

const LINK_CODE_TTL_MINUTES = 5;
const LINK_CODE_TTL_MS = LINK_CODE_TTL_MINUTES * MS_PER_MINUTE;
export const LINK_CODE_DIGITS = 6;
const LINK_CODE_MAX = 1_000_000;
const LINK_CODE_RETRY_CAP = 8;

export interface LinkCodeRow {
    code: string;
    site_account_id: string;
    expires_at: number;
    redeemed_at: number | null;
    created_at: number;
}

function formatCode(n: number): string {
    return n.toString().padStart(LINK_CODE_DIGITS, "0");
}

function sweepExpired(now: number): void {
    sweepExpiredRows("clansocket_device_link_codes", now, "redeemed_at IS NOT NULL");
}

export function mintLinkCode(siteAccountId: string): string {
    const now = Date.now();
    sweepExpired(now);
    const db = getDb(DB_NAMES.APP);
    const expiresAt = now + LINK_CODE_TTL_MS;
    const insert = db.prepare(
        `INSERT INTO clansocket_device_link_codes (code, site_account_id, expires_at, created_at)
         VALUES (?, ?, ?, ?)`,
    );
    for (let attempt = 0; attempt < LINK_CODE_RETRY_CAP; attempt += 1) {
        const code = formatCode(randomInt(0, LINK_CODE_MAX));
        try {
            insert.run(code, siteAccountId, expiresAt, now);
            return code;
        } catch (err) {
            logger.debug(`[device-link] code collision attempt=${attempt}: ${(err as Error).message}`);
            continue;
        }
    }
    throw new Error(`link_code_collision_cap_exceeded: siteAccountId=${siteAccountId} attempts=${LINK_CODE_RETRY_CAP}`);
}

export function consumeLinkCode(code: string): { siteAccountId: string } | null {
    const now = Date.now();
    sweepExpired(now);
    const db = getDb(DB_NAMES.APP);
    return db.transaction((): { siteAccountId: string } | null => {
        const row = db
            .prepare(
                `SELECT site_account_id, expires_at, redeemed_at
                 FROM clansocket_device_link_codes WHERE code = ?`,
            )
            .get(code) as { site_account_id: string; expires_at: number; redeemed_at: number | null } | undefined;
        if (!row) return null;
        if (row.redeemed_at !== null) return null;
        if (row.expires_at <= now) return null;
        db.prepare(`UPDATE clansocket_device_link_codes SET redeemed_at = ? WHERE code = ?`).run(now, code);
        return { siteAccountId: row.site_account_id };
    })();
}
