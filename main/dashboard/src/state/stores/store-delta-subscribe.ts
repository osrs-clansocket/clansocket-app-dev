import type { RowDelta } from "@clansocket/realtime";
import type { DeltaFeed, FetchStoreState, FetchUnsub } from "./lazy-store-types.js";

export function makeSubscribeDelta<T>(state: FetchStoreState<T>): (feed: DeltaFeed<T>) => FetchUnsub {
    return (feed) => {
        let lastSeq = 0;
        const apply = feed.apply ?? ((_current: T, d: RowDelta): T => d.row as T);
        return feed.subscribe((batch) => {
            for (const d of batch.deltas) {
                if (d.seq <= lastSeq) continue;
                lastSeq = d.seq;
                state.data.set(apply(state.data(), d));
            }
        });
    };
}
