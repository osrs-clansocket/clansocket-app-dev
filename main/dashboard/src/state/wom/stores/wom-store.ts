import { statusStoreRegistry, type StatusStore } from "../../stores/status-store-factory.js";
import { getWomStatus, openWomStream, type WomStatus } from "../clients/wom-client.js";

export type WomStore = StatusStore<WomStatus>;

const EMPTY_STATUS: WomStatus = { linked: false };
const MAX_CLAN_STORES = 4;

const registry = statusStoreRegistry<WomStatus>({
    fetch: getWomStatus,
    stream: openWomStream,
    empty: EMPTY_STATUS,
    maxEntries: MAX_CLAN_STORES,
});

export function womStoreFor(slug: string): WomStore {
    return registry.storeFor(slug);
}

export function clearWomStores(): void {
    registry.clear();
}
