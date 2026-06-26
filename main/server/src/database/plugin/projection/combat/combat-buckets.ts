import type Database from "better-sqlite3";
import { BUCKET_MS } from "../projection-utils.js";
import type { DealtFacts, TakenFacts } from "./combat-facts.js";

interface BaseBucketArgs {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    now: number;
}

export interface DealtBucketArgs extends BaseBucketArgs {
    facts: DealtFacts;
}

export interface TakenBucketArgs extends BaseBucketArgs {
    facts: TakenFacts;
}

interface BucketKind<F> {
    sql: string;
    extras: (facts: F) => Record<string, unknown>;
}

const DEALT_KIND: BucketKind<DealtFacts> = {
    sql: `INSERT INTO plugin_damage_buckets
            (account_hash, rsn, source_kind, source_id, source_name, target_kind, target_id, target_name, hitsplat_type, damage_type, minute_bucket, timestamp, dealt_total, hit_count_dealt)
         VALUES ($accountHash, $rsn, 'self', 0, '', $targetKind, $targetId, $targetName, $hitsplatId, $damageType, $bucket, $bucketTs, $amount, 1)
         ON CONFLICT (account_hash, source_kind, source_id, source_name, target_kind, target_id, target_name, hitsplat_type, damage_type, minute_bucket) DO UPDATE SET
            rsn = COALESCE(excluded.rsn, rsn),
            dealt_total = dealt_total + excluded.dealt_total,
            hit_count_dealt = hit_count_dealt + 1`,
    extras: (facts) => ({
        damageType: facts.damageType,
        targetKind: facts.targetKind ?? "UNKNOWN",
        targetId: facts.targetId ?? 0,
        targetName: facts.targetName ?? facts.targetKind ?? "unknown",
    }),
};

const TAKEN_KIND: BucketKind<TakenFacts> = {
    sql: `INSERT INTO plugin_damage_buckets
            (account_hash, rsn, source_kind, source_id, source_name, target_kind, target_id, target_name, hitsplat_type, damage_type, minute_bucket, timestamp, taken_total, hit_count_taken)
         VALUES ($accountHash, $rsn, $sourceKind, $sourceId, $sourceName, 'self', 0, '', $hitsplatId, 'UNKNOWN', $bucket, $bucketTs, $amount, 1)
         ON CONFLICT (account_hash, source_kind, source_id, source_name, target_kind, target_id, target_name, hitsplat_type, damage_type, minute_bucket) DO UPDATE SET
            rsn = COALESCE(excluded.rsn, rsn),
            taken_total = taken_total + excluded.taken_total,
            hit_count_taken = hit_count_taken + 1`,
    extras: (facts) => ({
        sourceKind: facts.sourceKind ?? "UNKNOWN",
        sourceId: facts.sourceId ?? 0,
        sourceName: facts.sourceName ?? facts.sourceKind ?? "unknown",
    }),
};

function writeBucket<F extends { amount: number; hitsplatId?: number | null }>(
    args: BaseBucketArgs & { facts: F },
    kind: BucketKind<F>,
): void {
    const bucket = Math.floor(args.now / BUCKET_MS);
    args.conn.prepare(kind.sql).run({
        accountHash: args.accountHash,
        rsn: args.rsn,
        bucket,
        bucketTs: bucket * BUCKET_MS,
        amount: args.facts.amount,
        hitsplatId: args.facts.hitsplatId ?? 0,
        ...kind.extras(args.facts),
    });
}

export const writeDealtBucket = (args: DealtBucketArgs): void => writeBucket(args, DEALT_KIND);
export const writeTakenBucket = (args: TakenBucketArgs): void => writeBucket(args, TAKEN_KIND);
