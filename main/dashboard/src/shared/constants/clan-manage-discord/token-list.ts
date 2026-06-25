import { DEFAULT_CONTENT_TEMPLATE_BY_TRIGGER, TRIGGER_LABELS } from "./token-list-templates.js";
import { TOKEN_LIST_BY_TRIGGER, UNIVERSAL_TOKENS, type TokenInfo } from "./token-list-tokens.js";
export type { TokenInfo } from "./token-list-tokens.js";
export { DEFAULT_CONTENT_TEMPLATE_BY_TRIGGER, TRIGGER_LABELS } from "./token-list-templates.js";
export { TOKEN_LIST_BY_TRIGGER, UNIVERSAL_TOKENS } from "./token-list-tokens.js";

export function listTriggerTypes(): readonly string[] {
    return Object.keys(TRIGGER_LABELS);
}

export function tokensForTrigger(triggerType: string): readonly TokenInfo[] {
    return [...UNIVERSAL_TOKENS, ...(TOKEN_LIST_BY_TRIGGER[triggerType] ?? [])];
}

export function getDefaultTemplate(triggerType: string): string {
    return DEFAULT_CONTENT_TEMPLATE_BY_TRIGGER[triggerType] ?? "";
}

export function getTriggerLabel(triggerType: string): string {
    return TRIGGER_LABELS[triggerType] ?? triggerType;
}

export function sampleTokens(triggerType: string): Record<string, string> {
    const map: Record<string, string> = {};
    for (const t of tokensForTrigger(triggerType)) {
        map[t.token] = t.sampleValue;
    }
    return map;
}
