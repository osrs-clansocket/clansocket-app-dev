import { nonEmptyString } from "../../../shared/coerce.js";
import { isPlainObject } from "../../../shared/validators/type-guards.js";

export const SCOPE_APP = "app",
    SCOPE_VAREZ = "varez";
export const SCOPE_CLAN = "clan",
    SCOPE_CLAN_AUDIT = "clan_audit",
    SCOPE_CLAN_FLOWS = "clan_flows",
    SCOPE_PLUGIN = "plugin";

export type Scope =
    | { kind: typeof SCOPE_APP }
    | { kind: typeof SCOPE_VAREZ }
    | { kind: typeof SCOPE_CLAN; clanId: string }
    | { kind: typeof SCOPE_CLAN_AUDIT; clanId: string }
    | { kind: typeof SCOPE_CLAN_FLOWS; clanId: string }
    | { kind: typeof SCOPE_PLUGIN; clanId: string; mode: string };

type SimpleScopeKind = typeof SCOPE_APP | typeof SCOPE_VAREZ;
type BoundScopeKind = typeof SCOPE_CLAN | typeof SCOPE_CLAN_AUDIT | typeof SCOPE_CLAN_FLOWS;

const SIMPLE_SCOPES = new Set<string>([SCOPE_APP, SCOPE_VAREZ]);
const CLAN_BOUND_SCOPES = new Set<string>([SCOPE_CLAN, SCOPE_CLAN_AUDIT, SCOPE_CLAN_FLOWS]);

export function parseScope(raw: unknown): Scope | null {
    if (!isPlainObject(raw)) return null;
    const s = raw as { kind?: unknown; clanId?: unknown; mode?: unknown };
    const kind = nonEmptyString(s.kind);
    if (kind === null) return null;
    if (SIMPLE_SCOPES.has(kind)) return { kind: kind as SimpleScopeKind };
    if (CLAN_BOUND_SCOPES.has(kind)) {
        const clanId = nonEmptyString(s.clanId);
        return clanId === null ? null : { kind: kind as BoundScopeKind, clanId };
    }
    if (kind === SCOPE_PLUGIN) {
        const clanId = nonEmptyString(s.clanId);
        const mode = nonEmptyString(s.mode);
        return clanId === null || mode === null ? null : { kind: SCOPE_PLUGIN, clanId, mode };
    }
    return null;
}

export interface TablePlan {
    table: string;
    ownershipColumn: string;
    action: "delete" | "null";
    excludeColumns: readonly string[];
    browseOrder?: readonly string[];
    identifierValues: readonly string[];
    customWhere?: { sql: string; args: readonly unknown[] };
}
