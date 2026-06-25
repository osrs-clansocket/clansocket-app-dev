import { getClanDb } from "../../../core/database.js";
import type { ClanRosterDiff } from "./types.js";

export type { RosterDiffEvent } from "./diffs-build.js";
export { diffRosters } from "./diffs-build.js";

export function listFingerprintDiffs(clanId: string, toFingerprint: string): ClanRosterDiff[] {
    const db = getClanDb(clanId);
    const rows = db
        .prepare(
            `SELECT event_type, member_name, old_value, new_value, detected_at
             FROM clan_roster_diffs
             WHERE to_fingerprint = ?
             ORDER BY id ASC`,
        )
        .all(toFingerprint) as Array<{
        event_type: "member_joined" | "member_left" | "rank_changed";
        member_name: string;
        old_value: string | null;
        new_value: string | null;
        detected_at: number;
    }>;
    return rows.map((r) => ({
        eventType: r.event_type,
        memberName: r.member_name,
        oldValue: r.old_value,
        newValue: r.new_value,
        detectedAt: r.detected_at,
    }));
}
