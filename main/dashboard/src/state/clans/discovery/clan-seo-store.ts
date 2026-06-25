import { createFetchStore } from "../../stores/lazy-store.js";
import { clansClient, type ManageClanSeo } from "../clans-client/index.js";

let activeSlug = "";

const NEVER_AUTO_REFRESH = (): (() => void) => () => undefined;

export const clanSeoStore = createFetchStore<ManageClanSeo | null, "seo$">({
    key: "seo$",
    initial: null,
    load: async () => {
        if (activeSlug === "") return null;
        return clansClient.fetchSeo(activeSlug);
    },
    subscribe: NEVER_AUTO_REFRESH,
});

export function setActiveSlug(slug: string): void {
    if (activeSlug === slug) return;
    activeSlug = slug;
    void clanSeoStore.refresh();
}

export function refreshActive(): Promise<void> {
    return clanSeoStore.refresh();
}
