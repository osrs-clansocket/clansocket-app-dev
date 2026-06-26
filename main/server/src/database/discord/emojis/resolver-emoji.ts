import type { AppEmojiHit } from "./emoji-types.js";
import { buildLookupCandidates } from "./builder-emoji-candidates.js";
import { runLookup, tryAlias } from "./reader-emoji.js";

export type { AppEmojiHit } from "./emoji-types.js";

export function appEmoji(botId: string, name: string): AppEmojiHit | null {
    const candidates = buildLookupCandidates(name);
    for (const c of candidates) {
        const hit = runLookup(botId, c);
        if (hit !== null) return hit;
    }
    for (const c of candidates.slice(1)) {
        const alias = tryAlias(botId, c);
        if (alias !== null) return alias;
    }
    return null;
}
