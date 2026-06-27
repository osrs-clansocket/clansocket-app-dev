import { getClanDb } from "../core/database.js";

export interface MemberPreferences {
    readonly rsn: string;
    readonly timezone: string | null;
    readonly quietHoursStart: number | null;
    readonly quietHoursEnd: number | null;
    readonly channelOptOut: Readonly<Record<string, boolean>>;
    readonly newsletterOptIn: Readonly<Record<string, boolean>>;
}

interface PreferenceRow {
    rsn: string;
    timezone: string | null;
    quiet_hours_start: number | null;
    quiet_hours_end: number | null;
    channel_opt_out_json: string;
    newsletter_opt_in_json: string;
}

const SELECT_SQL = `SELECT rsn, timezone, quiet_hours_start, quiet_hours_end, channel_opt_out_json, newsletter_opt_in_json
    FROM clan_member_preferences WHERE rsn = ?`;

function parseJsonObject(raw: string): Readonly<Record<string, boolean>> {
    try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const out: Record<string, boolean> = {};
        for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === "boolean") out[k] = v;
        }
        return out;
    } catch {
        return {};
    }
}

export function memberPreferences(clanId: string, rsn: string): MemberPreferences | null {
    if (rsn.length === 0) return null;
    try {
        const row = getClanDb(clanId).prepare(SELECT_SQL).get(rsn) as PreferenceRow | undefined;
        if (!row) return null;
        return {
            rsn: row.rsn,
            timezone: row.timezone,
            quietHoursStart: row.quiet_hours_start,
            quietHoursEnd: row.quiet_hours_end,
            channelOptOut: parseJsonObject(row.channel_opt_out_json),
            newsletterOptIn: parseJsonObject(row.newsletter_opt_in_json),
        };
    } catch {
        return null;
    }
}
