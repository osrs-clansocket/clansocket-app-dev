import type { ReadSignal } from "../../dom/factory/reactive";
import { createFetchStore, type FetchStore } from "../stores/lazy-store.js";
import { boundedRegistry } from "../stores/bounded-store-registry.js";
import { sameOriginFetch } from "../../shared/fetchers/same-origin-fetcher.js";
import { openServersStream, type DiscordServer } from "./client.js";

const EMPTY: readonly DiscordServer[] = [];
const MAX_CLAN_STORES = 4;

type ServersData = readonly DiscordServer[] | null;

type DiscordServersStore = FetchStore & { readonly servers: ReadSignal<ServersData> };

const registry = boundedRegistry<DiscordServersStore>(MAX_CLAN_STORES);

async function loadServers(slug: string): Promise<readonly DiscordServer[]> {
    const res = await sameOriginFetch(`/api/discord/clans/${encodeURIComponent(slug)}/servers`);
    if (!res.ok) return EMPTY;
    const body = (await res.json()) as { servers?: DiscordServer[] };
    return body.servers ?? EMPTY;
}

function makeStore(slug: string): DiscordServersStore {
    return createFetchStore<ServersData, "servers">({
        key: "servers",
        initial: null,
        load: () => loadServers(slug),
        subscribe: (refetch) => openServersStream(slug, refetch),
    });
}

export function serversStoreFor(slug: string): DiscordServersStore {
    return registry.get(slug, makeStore);
}

export function clearServersStores(): void {
    registry.clear();
}
