import logger from "@clansocket/logger";
import { getClanDb } from "../../../core/database.js";
import { ClanAuditActions } from "../../audit/clan-audit-actions.js";
import { recordClanAudit } from "../../audit/clan-audit/record.js";
import { pruneOldAudit } from "../../audit/clan-audit/retention.js";
import { triggerOnRoster } from "../../../../runewatch/triggers/trigger-on-roster.js";
import { buildRosterContext, canonicalizeMembers, type RosterContext } from "./record-context.js";
import {
    insertClanSnapshot,
    insertRosterSnapshot,
    recordRosterDiffs,
    upsertMembers,
    type PreviousRoster,
} from "./record-inserts.js";
import type { ClanRosterMember } from "./types.js";

interface AuditArgs {
    clanId: string;
    capturedByAccountHash: string;
    fingerprint: string;
    members: ClanRosterMember[];
    diffCount: number;
    previous: PreviousRoster | undefined;
}

function emitRosterAudit(args: AuditArgs): void {
    recordClanAudit(args.clanId, {
        actor: null,
        action: ClanAuditActions.RosterChanged,
        targetId: args.fingerprint,
        payload: {
            diffCount: args.diffCount,
            capturedByAccountHash: args.capturedByAccountHash,
            memberCount: args.members.length,
            fromFingerprint: args.previous?.fingerprint ?? null,
        },
    });
}

interface RosterTxArgs {
    db: ReturnType<typeof getClanDb>;
    ctx: RosterContext;
    clanId: string;
    capturedByAccountHash: string;
    fingerprint: string;
    members: ClanRosterMember[];
    now: number;
}

function insertAllSnapshots(args: RosterTxArgs): void {
    insertRosterSnapshot({
        db: args.db,
        fingerprint: args.fingerprint,
        now: args.now,
        capturedByAccountHash: args.capturedByAccountHash,
        capturedByRsn: args.ctx.capturedByRsn,
        members: args.members,
    });
    insertClanSnapshot({
        db: args.db,
        capturedByAccountHash: args.capturedByAccountHash,
        capturedByRsn: args.ctx.capturedByRsn,
        clanId: args.clanId,
        clanName: args.ctx.clanName,
        memberCount: args.members.length,
        now: args.now,
    });
    upsertMembers(args.db, args.members, args.now);
}

function runRosterTx(args: RosterTxArgs): number {
    let diffCount = 0;
    args.db.transaction(() => {
        logger.debug(`[roster] tx clanId=${args.clanId} members=${args.members.length}`);
        insertAllSnapshots(args);
        if (args.ctx.previous && args.ctx.previous.fingerprint !== args.fingerprint) {
            diffCount = recordRosterDiffs({
                db: args.db,
                previous: args.ctx.previous,
                fingerprint: args.fingerprint,
                members: args.members,
                now: args.now,
            });
        }
    })();
    return diffCount;
}

export function recordClanRoster(
    clanId: string,
    capturedByAccountHash: string,
    fingerprint: string,
    members: ClanRosterMember[],
): { stored: boolean; diffCount: number } {
    const db = getClanDb(clanId);
    const now = Date.now();
    const ctx = buildRosterContext(db, clanId, capturedByAccountHash);
    canonicalizeMembers(members);
    const diffCount = runRosterTx({ db, ctx, clanId, capturedByAccountHash, fingerprint, members, now });
    emitRosterAudit({ clanId, capturedByAccountHash, fingerprint, members, diffCount, previous: ctx.previous });
    pruneOldAudit(clanId);
    if (diffCount > 0) triggerOnRoster(clanId);
    logger.debug(`[roster] recordClanRoster clanId=${clanId} members=${members.length} diffs=${diffCount}`);
    return { stored: true, diffCount };
}
