// One-time migration: shard public/resources/osrs/icon_item_ids/ into mod-256 subdirs.
//
// Before: icon_item_ids/123.webp  (33k+ files in one dir — slow ls/rsync, fs cache cliff)
// After:  icon_item_ids/7b/123.webp  (256 subdirs × ~130 files each)
//
// Uses mod-256 sharding by item ID. Pure arithmetic, deterministic, distributes evenly.
//
// Run modes:
//   node scripts/build-scripts/migrate-item-shards-script.mjs --dry         (preview only)
//   node scripts/build-scripts/migrate-item-shards-script.mjs --apply       (actually move)
//   node scripts/build-scripts/migrate-item-shards-script.mjs --verify      (check consistency post-migration)
//
// Idempotent — if a file is already in a shard subdir, skipped. Safe to re-run.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const itemsDir = path.resolve(repoRoot, "public", "resources", "osrs", "icon_item_ids");

const args = process.argv.slice(2);
const isDry = args.includes("--dry");
const isApply = args.includes("--apply");
const isVerify = args.includes("--verify");

if (!isDry && !isApply && !isVerify) {
    console.error("Usage: node migrate-item-shards-script.mjs [--dry | --apply | --verify]");
    process.exit(1);
}

function shardOf(itemId) {
    return (itemId % 256).toString(16).padStart(2, "0");
}

function isShardName(name) {
    return /^[0-9a-f]{2}$/.test(name);
}

function planMigration() {
    if (!fs.existsSync(itemsDir)) {
        console.error(`[shard-items] items directory not found: ${itemsDir}`);
        process.exit(1);
    }
    const moves = [];
    const alreadySharded = [];
    const malformed = [];
    for (const entry of fs.readdirSync(itemsDir, { withFileTypes: true })) {
        const name = entry.name;
        if (entry.isDirectory()) {
            if (isShardName(name)) alreadySharded.push(name);
            continue;
        }
        const m = /^(\d+)\.webp$/.exec(name);
        if (!m) {
            malformed.push(name);
            continue;
        }
        const itemId = parseInt(m[1], 10);
        const shard = shardOf(itemId);
        const from = path.join(itemsDir, name);
        const to = path.join(itemsDir, shard, name);
        moves.push({ from, to, itemId, shard });
    }
    return { moves, alreadySharded, malformed };
}

function applyMigration(moves) {
    const startedAt = Date.now();
    const shardsCreated = new Set();
    let moved = 0;
    let errored = 0;
    for (const { from, to, shard } of moves) {
        try {
            const shardDir = path.dirname(to);
            if (!shardsCreated.has(shardDir)) {
                fs.mkdirSync(shardDir, { recursive: true });
                shardsCreated.add(shardDir);
            }
            fs.renameSync(from, to);
            moved += 1;
        } catch (err) {
            console.error(`[shard-items] failed to move ${from} → ${to}: ${err.message}`);
            errored += 1;
        }
    }
    const elapsed = Date.now() - startedAt;
    return { moved, errored, shardsCreated: shardsCreated.size, elapsedMs: elapsed };
}

function verifyMigration() {
    const issues = [];
    const fileCount = { sharded: 0, root: 0 };
    for (const entry of fs.readdirSync(itemsDir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!isShardName(entry.name)) {
                issues.push(`unexpected non-shard directory: ${entry.name}`);
                continue;
            }
            const shardDir = path.join(itemsDir, entry.name);
            for (const file of fs.readdirSync(shardDir)) {
                const m = /^(\d+)\.webp$/.exec(file);
                if (!m) {
                    issues.push(`non-webp in shard ${entry.name}: ${file}`);
                    continue;
                }
                const itemId = parseInt(m[1], 10);
                const expectedShard = shardOf(itemId);
                if (expectedShard !== entry.name) {
                    issues.push(
                        `${file} is in shard ${entry.name} but should be in ${expectedShard} (item ${itemId})`,
                    );
                }
                fileCount.sharded += 1;
            }
        } else {
            const m = /^(\d+)\.webp$/.exec(entry.name);
            if (m) {
                fileCount.root += 1;
                issues.push(`unsharded item still at root: ${entry.name}`);
            }
        }
    }
    return { issues, fileCount };
}

function main() {
    if (isVerify) {
        console.log(`[shard-items] verifying ${itemsDir}`);
        const { issues, fileCount } = verifyMigration();
        console.log(`  sharded files: ${fileCount.sharded}`);
        console.log(`  unsharded files at root: ${fileCount.root}`);
        if (issues.length > 0) {
            console.error(`[shard-items] VERIFY FAIL — ${issues.length} issue(s):`);
            for (const issue of issues.slice(0, 20)) console.error(`    ${issue}`);
            if (issues.length > 20) console.error(`    ... and ${issues.length - 20} more`);
            process.exit(1);
        }
        console.log("[shard-items] VERIFY PASS");
        return;
    }

    console.log(`[shard-items] planning migration of ${itemsDir}`);
    const { moves, alreadySharded, malformed } = planMigration();
    console.log(`  files to move: ${moves.length}`);
    console.log(`  shards already present: ${alreadySharded.length}`);
    console.log(`  malformed names (skipped): ${malformed.length}`);
    if (malformed.length > 0 && malformed.length <= 20) {
        for (const name of malformed) console.log(`    ${name}`);
    }
    if (moves.length === 0) {
        console.log("[shard-items] nothing to do.");
        return;
    }

    if (isDry) {
        const sample = moves.slice(0, 5);
        console.log(`[shard-items] DRY RUN — sample of planned moves:`);
        for (const m of sample) console.log(`    ${path.basename(m.from)} → ${m.shard}/${path.basename(m.from)}`);
        if (moves.length > 5) console.log(`    ... and ${moves.length - 5} more`);
        console.log(`[shard-items] re-run with --apply to perform the migration.`);
        return;
    }

    console.log(`[shard-items] applying — this will move ${moves.length} files (rename, no data copy)`);
    const result = applyMigration(moves);
    console.log(
        `[shard-items] complete: moved=${result.moved} errored=${result.errored} ` +
            `shards-created=${result.shardsCreated} elapsed=${result.elapsedMs}ms`,
    );
    if (result.errored > 0) {
        console.error(`[shard-items] ${result.errored} move(s) failed — see errors above.`);
        process.exit(1);
    }
}

main();
