import { TAB_KEYS, loadTabBuilder } from "./tabs.js";

const DEFAULT_KEY = TAB_KEYS[0]!;

export function resolveTabKey(input: string | null): string {
    if (input === null) return DEFAULT_KEY;
    return TAB_KEYS.includes(input) ? input : DEFAULT_KEY;
}

export async function buildTab(key: string, slug: string, subTab?: string | null): Promise<HTMLElement> {
    const tabBuilder = await loadTabBuilder(key);
    if (tabBuilder) return tabBuilder(slug, subTab);
    const fallback = await loadTabBuilder(DEFAULT_KEY);
    if (!fallback) throw new Error(`no manage tab loader found for default key "${DEFAULT_KEY}"`);
    return fallback(slug, subTab);
}

export { TAB_KEYS };
