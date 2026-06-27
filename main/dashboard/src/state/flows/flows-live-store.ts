import { signal, type Signal } from "../../dom/factory";
import { projectionSource } from "../data-rights/data-rights-client/streams/projection-source.js";
import { listFlows, type FlowListEntry } from "./flows-client.js";

const subscribed = new Set<string>();

export interface FlowsLiveBundle {
    readonly entries: Signal<readonly FlowListEntry[]>;
    refresh(): Promise<void>;
}

const bundles = new Map<string, FlowsLiveBundle>();

function createBundle(clanId: string): FlowsLiveBundle {
    const entries: Signal<readonly FlowListEntry[]> = signal<readonly FlowListEntry[]>([]);
    const refresh = async (): Promise<void> => {
        const rows = await listFlows(clanId);
        entries.set(rows);
    };
    void refresh();
    return { entries, refresh };
}

function ensureBundle(clanId: string): FlowsLiveBundle {
    const existing = bundles.get(clanId);
    if (existing) return existing;
    const bundle = createBundle(clanId);
    bundles.set(clanId, bundle);
    if (!subscribed.has(clanId)) {
        subscribed.add(clanId);
        const src = projectionSource({ topic: "flows", clanId });
        src.subscribe(
            () => void bundle.refresh(),
            () => void bundle.refresh(),
        );
    }
    return bundle;
}

export function flowsLiveFor(clanId: string): FlowsLiveBundle {
    return ensureBundle(clanId);
}
