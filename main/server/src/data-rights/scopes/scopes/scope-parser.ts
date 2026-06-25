import { SCOPE_APP, SCOPE_CLAN, SCOPE_CLAN_AUDIT, SCOPE_PLUGIN, SCOPE_VAREZ, type Scope } from "../user-scope/index.js";

const SIMPLE_SCOPE_KEYS = new Set<string>([SCOPE_APP, SCOPE_VAREZ]);

export function isSimpleScope(kind: string): boolean {
    return SIMPLE_SCOPE_KEYS.has(kind);
}

function parsePrefixed<T extends string>(scopeKey: string, prefix: T): string | null {
    if (!scopeKey.startsWith(prefix)) return null;
    const tail = scopeKey.slice(prefix.length);
    return tail.length === 0 ? null : tail;
}

export function scopeScopeKey(scopeKey: string): Scope | null {
    if (isSimpleScope(scopeKey)) {
        return { kind: scopeKey } as Scope;
    }
    const clanIdAlone = parsePrefixed(scopeKey, `${SCOPE_CLAN}:`);
    if (clanIdAlone !== null) return { kind: SCOPE_CLAN, clanId: clanIdAlone };
    const auditClanId = parsePrefixed(scopeKey, `${SCOPE_CLAN_AUDIT}:`);
    if (auditClanId !== null) return { kind: SCOPE_CLAN_AUDIT, clanId: auditClanId };
    const pluginTail = parsePrefixed(scopeKey, `${SCOPE_PLUGIN}:`);
    if (pluginTail !== null) {
        const colon = pluginTail.indexOf(":");
        if (colon === -1) return null;
        const clanId = pluginTail.slice(0, colon);
        const mode = pluginTail.slice(colon + 1);
        return clanId.length === 0 || mode.length === 0 ? null : { kind: SCOPE_PLUGIN, clanId, mode };
    }
    return null;
}
