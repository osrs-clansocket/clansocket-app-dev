import type { TokenSource } from "./render-template.js";
import { buildUniversalTokens, extractUniversalToken } from "./transforms/universal-tokens-transform.js";

export function augmentTokens(tokens: TokenSource, payload: object): TokenSource {
    const universals = buildUniversalTokens(extractUniversalToken(payload));
    return { ...tokens, ...universals };
}
