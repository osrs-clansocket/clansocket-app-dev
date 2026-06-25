import { DB_NAMES, getDb } from "../database/index.js";
import { listAccountManagers } from "../database/clans/access/clan-manager-store.js";
import { buildClanView, type ClanRow, type ManagedClanView } from "./clan-view-builder.js";

const MANAGER_ROLE_FALLBACK = "manager";
const GRANTED_VIA_FALLBACK = "unknown";

export type { ManagedClanView, ManagedRoster, ManagedRosterMember } from "./clan-view-builder.js";

function loadManagedClans(managerIds: string[]): ClanRow[] {
    const placeholders = managerIds.map(() => "?").join(", ");
    return getDb(DB_NAMES.APP)
        .prepare(
            `SELECT id, slug, display_name, status, icon_kind, icon_value, color, created_at
             FROM clansocket_clans
             WHERE id IN (${placeholders}) AND archived_at IS NULL`,
        )
        .all(...managerIds) as ClanRow[];
}

export function listManagedClans(siteAccountId: string): ManagedClanView[] {
    const managers = listAccountManagers(siteAccountId);
    if (managers.length === 0) return [];
    const rows = loadManagedClans(managers.map((m) => m.clan_id));
    const rolesById: Record<string, (typeof managers)[number]> = {};
    for (const m of managers) rolesById[m.clan_id] = m;
    const out = rows.map((r) => {
        const role = rolesById[r.id];
        return buildClanView(
            r,
            role?.role ?? MANAGER_ROLE_FALLBACK,
            role?.granted_via ?? GRANTED_VIA_FALLBACK,
            role?.granted_at ?? 0,
        );
    });
    out.sort((a, b) => a.grantedAt - b.grantedAt);
    return out;
}
