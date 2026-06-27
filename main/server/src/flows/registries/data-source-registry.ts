import { BaseRegistry } from "../../base/base-registry.js";
import { capabilityRegistry } from "./capability-registry.js";
import type { DataSourceAdapter } from "./registry-types.js";

class DataSourceRegistryStore extends BaseRegistry<string, DataSourceAdapter> {}

const STORE = new DataSourceRegistryStore();

function populate(): void {
    for (const manifest of capabilityRegistry.list()) {
        for (const [sourceId, adapter] of Object.entries(manifest.data_sources)) {
            const qualified = `${manifest.name}:${sourceId}`;
            STORE.register(qualified, adapter);
        }
    }
}

populate();

export const dataSourceRegistry = STORE;
