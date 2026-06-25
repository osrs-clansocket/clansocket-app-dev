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

const SIMPLE_SCOPE_KINDS = new Set<string>([SCOPE_APP, SCOPE_VAREZ]);

function indexUserScope(out: Map<string, Scope>, s: ReturnType<typeof listUserScopes>[number]): void {
    if (SIMPLE_SCOPE_KINDS.has(s.kind)) {
        out.set(s.kind, { kind: s.kind } as Scope);
        return;
    }
    if (s.kind === SCOPE_CLAN && s.clanId) {
        out.set(scopeKeyClan(s.clanId), { kind: SCOPE_CLAN, clanId: s.clanId });
        return;
    }
    if (s.kind === SCOPE_CLAN_AUDIT && s.clanId) {
        out.set(auditScopeKey(s.clanId), { kind: SCOPE_CLAN_AUDIT, clanId: s.clanId });
        return;
    }
    if (s.kind === SCOPE_PLUGIN && s.clanId && s.mode) {
        out.set(scopeKeyPlugin(s.clanId, s.mode), { kind: SCOPE_PLUGIN, clanId: s.clanId, mode: s.mode });
    }
}

function writesScopeMap(siteAccountId: string): Map<string, Scope> {
    const out = new Map<string, Scope>();
    for (const s of listUserScopes(siteAccountId)) indexUserScope(out, s);
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
