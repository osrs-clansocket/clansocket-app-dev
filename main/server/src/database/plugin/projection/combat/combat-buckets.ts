import type Database from "better-sqlite3";
import { BUCKET_MS } from "../projection-utils.js";
import type { DealtFacts, TakenFacts } from "./combat-facts.js";

export interface DealtBucketArgs {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    facts: DealtFacts;
    now: number;
}

export interface TakenBucketArgs {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    facts: TakenFacts;
    now: number;
}

export function writeDealtBucket(args: DealtBucketArgs): void {
    const { conn, accountHash, rsn, facts, now } = args;
    const bucket = Math.floor(now / BUCKET_MS);
    conn.prepare(
        `INSERT INTO plugin_damage_buckets
            (account_hash, rsn, source_kind, source_id, source_name, target_kind, target_id, target_name, hitsplat_type, damage_type, minute_bucket, timestamp, dealt_total, hit_count_dealt)
         VALUES ($accountHash, $rsn, 'self', 0, '', $targetKind, $targetId, $targetName, $hitsplatId, $damageType, $bucket, $bucketTs, $amount, 1)
         ON CONFLICT (account_hash, source_kind, source_id, source_name, target_kind, target_id, target_name, hitsplat_type, damage_type, minute_bucket) DO UPDATE SET
            rsn = COALESCE(excluded.rsn, rsn),
            dealt_total = dealt_total + excluded.dealt_total,
            hit_count_dealt = hit_count_dealt + 1`,
    ).run({
        accountHash,
        rsn,
        bucket,
        damageType: facts.damageType,
        amount: facts.amount,
        bucketTs: bucket * BUCKET_MS,
        targetKind: facts.targetKind ?? "UNKNOWN",
        targetId: facts.targetId ?? 0,
        targetName: facts.targetName ?? facts.targetKind ?? "unknown",
        hitsplatId: facts.hitsplatId ?? 0,
    });
}

export function writeTakenBucket(args: TakenBucketArgs): void {
    const { conn, accountHash, rsn, facts, now } = args;
    const bucket = Math.floor(now / BUCKET_MS);
    conn.prepare(
        `INSERT INTO plugin_damage_buckets
            (account_hash, rsn, source_kind, source_id, source_name, target_kind, target_id, target_name, hitsplat_type, damage_type, minute_bucket, timestamp, taken_total, hit_count_taken)
         VALUES ($accountHash, $rsn, $sourceKind, $sourceId, $sourceName, 'self', 0, '', $hitsplatId, 'UNKNOWN', $bucket, $bucketTs, $amount, 1)
         ON CONFLICT (account_hash, source_kind, source_id, source_name, target_kind, target_id, target_name, hitsplat_type, damage_type, minute_bucket) DO UPDATE SET
            rsn = COALESCE(excluded.rsn, rsn),
            taken_total = taken_total + excluded.taken_total,
            hit_count_taken = hit_count_taken + 1`,
    ).run({
        accountHash,
        rsn,
        bucket,
        amount: facts.amount,
        bucketTs: bucket * BUCKET_MS,
        sourceKind: facts.sourceKind ?? "UNKNOWN",
        sourceId: facts.sourceId ?? 0,
        sourceName: facts.sourceName ?? facts.sourceKind ?? "unknown",
        hitsplatId: facts.hitsplatId ?? 0,
    });
}
