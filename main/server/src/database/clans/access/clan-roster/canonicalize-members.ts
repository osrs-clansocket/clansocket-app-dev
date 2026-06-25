import { canonicalRsn } from "../../../site/rsn/canonicalize.js";
import { normalizeRsn, verifiedRsnMap } from "./lookups.js";
import type { ClanRosterMember } from "./types.js";

export function canonicalizeMembers(members: ClanRosterMember[]): void {
    const verifiedHash = verifiedRsnMap();
    for (const m of members) {
        m.name = canonicalRsn(m.name);
        m.accountHash = verifiedHash[normalizeRsn(m.name)] ?? null;
    }
}
