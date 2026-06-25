export interface TileDelta {
    op: string;
    key: string;
    row?: unknown;
}

export function applyTileDeltas<T>(latest: readonly T[], deltas: TileDelta[], keyOf: (item: T) => string): T[] {
    const byKey = new Map(latest.map((item) => [keyOf(item), item]));
    for (const d of deltas) {
        if (d.op === "upsert" && d.row) byKey.set(d.key, d.row as T);
        else if (d.op === "remove") byKey.delete(d.key);
    }
    return [...byKey.values()];
}

export interface FeedHandle<T> {
    source: {
        subscribe: (
            onSnap: (snap: { rows: T[] }) => void,
            onBatch: (batch: { deltas: TileDelta[] }) => void,
        ) => () => void;
    };
}

export interface SubscribeArgs<T> {
    feed: FeedHandle<T>;
    getLatest: () => readonly T[];
    setLatest: (next: T[]) => void;
    rerender: () => void;
    keyOf: (item: T) => string;
}

export function subscribeTileFeed<T>(args: SubscribeArgs<T>): () => void {
    const { feed, getLatest, setLatest, rerender, keyOf } = args;
    return feed.source.subscribe(
        (snap) => {
            setLatest(snap.rows as T[]);
            rerender();
        },
        (batch) => {
            setLatest(applyTileDeltas(getLatest(), batch.deltas, keyOf));
            rerender();
        },
    );
}
