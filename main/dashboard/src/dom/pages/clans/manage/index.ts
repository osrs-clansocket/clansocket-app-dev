import "./tabs";
import { manageTabDefs, type ManageTabBuilder } from "./registry";

function liveKeys(): readonly string[] {
    return manageTabDefs().map((d) => d.key);
}

const DEFAULT_KEY = (): string => liveKeys()[0]!;

function resolveTabKey(input: string | null): string {
    if (input === null) return DEFAULT_KEY();
    return liveKeys().includes(input) ? input : DEFAULT_KEY();
}

function buildTab(key: string, slug: string, subTab?: string | null): HTMLElement {
    const defs = manageTabDefs();
    const def = defs.find((d) => d.key === key) ?? defs[0]!;
    return def.build(slug, subTab);
}

const TAB_KEYS: readonly string[] = new Proxy([] as string[], {
    has(_t, p): boolean {
        const live = liveKeys();
        if (p === "length" || p === Symbol.iterator) return true;
        if (typeof p === "string" && p.length > 0 && Number.isInteger(Number(p)) && Number(p) >= 0) {
            return Number(p) < live.length;
        }
        return Reflect.has(live, p);
    },
    get(_t, p): unknown {
        const live = liveKeys();
        if (p === "length") return live.length;
        if (p === Symbol.iterator) return live[Symbol.iterator].bind(live);
        if (typeof p === "string" && p.length > 0 && Number.isInteger(Number(p)) && Number(p) >= 0) {
            return live[Number(p)];
        }
        return Reflect.get(live, p, live);
    },
});

export { TAB_KEYS, resolveTabKey, buildTab };
export { defineManageTab } from "./registry";
export type { ManageTabBuilder };
