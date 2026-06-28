import { registerValueSource } from "../../registries/value-source-registry.js";
import { getClanDb } from "../../../database/core/database.js";

interface MemberRow {
    member_name: string;
    rank: string | null;
}

registerValueSource({
    format: "rsn",
    label: "Clan members (rsn)",
    fetch: async (clanId) => {
        const rows = getClanDb(clanId)
            .prepare("SELECT member_name, rank FROM clan_members ORDER BY member_name")
            .all() as MemberRow[];
        return rows.map((r) => ({ id: r.member_name, name: r.member_name, kind: r.rank ?? undefined }));
    },
});

registerValueSource({
    format: "clan-rank",
    label: "Clan ranks",
    fetch: async (clanId) => {
        const rows = getClanDb(clanId)
            .prepare("SELECT DISTINCT rank FROM clan_members WHERE rank IS NOT NULL ORDER BY rank")
            .all() as { rank: string }[];
        return rows.map((r) => ({ id: r.rank, name: r.rank }));
    },
});
