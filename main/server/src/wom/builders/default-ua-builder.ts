const DEFAULT_UA_PREFIX = "ClanSocket-clan-";

export function defaultUserAgent(clanId: string): string {
    return DEFAULT_UA_PREFIX + clanId;
}
