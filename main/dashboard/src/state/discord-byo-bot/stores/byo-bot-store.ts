import { statusStoreRegistry, type StatusStore } from "../../stores/status-store-factory.js";
import { getStatus, openStream, type ByoBotStatus } from "../clients/byo-bot-client.js";

export type ByoBotStore = StatusStore<ByoBotStatus>;

const EMPTY_STATUS: ByoBotStatus = { linked: false };
const MAX_CLAN_STORES = 4;

const registry = statusStoreRegistry<ByoBotStatus>({
    fetch: getStatus,
    stream: openStream,
    empty: EMPTY_STATUS,
    maxEntries: MAX_CLAN_STORES,
});

export function storeFor(slug: string): ByoBotStore {
    return registry.storeFor(slug);
}

export function clearByoBots(): void {
    registry.clear();
}
