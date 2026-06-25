import { getRunewatchCooldown } from "../../database/site/runewatch/cooldown-get.js";

export const RUNEWATCH_COOLDOWN_MS = 300000;

export function isFetchAllowed(now: number): boolean {
    const row = getRunewatchCooldown();
    return now - row.last_fetch_at >= RUNEWATCH_COOLDOWN_MS;
}

export function cooldownRemaining(now: number): number {
    const row = getRunewatchCooldown();
    const elapsed = now - row.last_fetch_at;
    if (elapsed >= RUNEWATCH_COOLDOWN_MS) return 0;
    return RUNEWATCH_COOLDOWN_MS - elapsed;
}
