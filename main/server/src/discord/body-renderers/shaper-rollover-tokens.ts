import type { TokenSource } from "./render-template.js";

export function rolloverTokens(rsn: string, completed: number, total: number, clanName: string | null): TokenSource {
    return { rsn, completed, total, clanName: clanName ?? "" };
}
