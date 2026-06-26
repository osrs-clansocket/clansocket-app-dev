import type { Response } from "express";
import { writeSseFrame } from "../../shared/http/sse-stream.js";
import { canSeeScope, hasUserRows, listUserScopes, scopeScopeKey } from "../scopes/scopes/index.js";
import {
    SCOPE_APP,
    SCOPE_CLAN,
    SCOPE_CLAN_AUDIT,
    SCOPE_PLUGIN,
    SCOPE_VAREZ,
    type Scope,
} from "../scopes/user-scope/index.js";
import { auditScopeKey, scopeKeyClan, scopeKeyPlugin, registerWriteListener } from "../streams/writes-stream.js";
import type { ParsedSub } from "./streams-sub-parser.js";

type UserScopeRow = ReturnType<typeof listUserScopes>[number];

const simpleIndexer = (out: Map<string, Scope>, s: UserScopeRow): void => {
    out.set(s.kind, { kind: s.kind } as Scope);
};

const clanIndexer =
    (kind: typeof SCOPE_CLAN | typeof SCOPE_CLAN_AUDIT, keyer: (id: string) => string) =>
    (out: Map<string, Scope>, s: UserScopeRow): void => {
        if (s.clanId) out.set(keyer(s.clanId), { kind, clanId: s.clanId } as Scope);
    };

const SCOPE_INDEXERS: Record<string, (out: Map<string, Scope>, s: UserScopeRow) => void> = {
    [SCOPE_APP]: simpleIndexer,
    [SCOPE_VAREZ]: simpleIndexer,
    [SCOPE_CLAN]: clanIndexer(SCOPE_CLAN, scopeKeyClan),
    [SCOPE_CLAN_AUDIT]: clanIndexer(SCOPE_CLAN_AUDIT, auditScopeKey),
    [SCOPE_PLUGIN]: (out, s) => {
        if (s.clanId && s.mode) {
            out.set(scopeKeyPlugin(s.clanId, s.mode), { kind: SCOPE_PLUGIN, clanId: s.clanId, mode: s.mode });
        }
    },
};

function writesScopeMap(siteAccountId: string): Map<string, Scope> {
    const out = new Map<string, Scope>();
    for (const s of listUserScopes(siteAccountId)) SCOPE_INDEXERS[s.kind]?.(out, s);
    return out;
}

interface ResolveScopeArgs {
    siteAccountId: string;
    scopeKey: string;
    scopeByKey: Map<string, Scope>;
    denied: Set<string>;
}

function orDenyScope(args: ResolveScopeArgs): { scope: Scope; added: boolean } | null {
    const { siteAccountId, scopeKey, scopeByKey, denied } = args;
    const cached = scopeByKey.get(scopeKey);
    if (cached) return { scope: cached, added: false };
    if (denied.has(scopeKey)) return null;
    if (!canSeeScope(siteAccountId, scopeKey)) {
        denied.add(scopeKey);
        return null;
    }
    const parsedScope = scopeScopeKey(scopeKey);
    if (!parsedScope) {
        denied.add(scopeKey);
        return null;
    }
    scopeByKey.set(scopeKey, parsedScope);
    return { scope: parsedScope, added: true };
}

export interface AttachWritesArgs {
    siteAccountId: string;
    sub: ParsedSub;
    res: Response;
    cleanupAll: () => void;
}

export function attachWritesStream(args: AttachWritesArgs): () => void {
    const { siteAccountId, sub, res, cleanupAll } = args;
    const scopeByKey = writesScopeMap(siteAccountId);
    const denied = new Set<string>();
    return registerWriteListener((event) => {
        const resolved = orDenyScope({ scopeByKey, denied, siteAccountId, scopeKey: event.scopeKey });
        if (resolved === null) return;
        const base = resolved.added ? { ...event, scopeAdded: true } : event;
        const payload =
            event.kind === "delete"
                ? { ...base, nowHasRows: hasUserRows(siteAccountId, resolved.scope, event.table) }
                : base;
        writeSseFrame(res, { id: sub.id, payload }, cleanupAll);
    });
}
