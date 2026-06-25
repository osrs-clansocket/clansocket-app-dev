interface Teardownable {
    teardown(): void;
}

export interface BoundedStoreRegistry<T extends Teardownable> {
    get(key: string, make: (key: string) => T): T;
    clear(): void;
}

class BoundedStoreImpl<T extends Teardownable> implements BoundedStoreRegistry<T> {
    private readonly map = new Map<string, T>();

    constructor(private readonly maxEntries: number) {}

    get(key: string, make: (key: string) => T): T {
        const existing = this.map.get(key);
        if (existing) return this.promote(key, existing);
        if (this.map.size >= this.maxEntries) this.evictOldest();
        const fresh = make(key);
        this.map.set(key, fresh);
        return fresh;
    }

    clear(): void {
        for (const s of this.map.values()) s.teardown();
        this.map.clear();
    }

    private promote(key: string, value: T): T {
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    private evictOldest(): void {
        const firstKey = this.map.keys().next().value;
        if (firstKey === undefined) return;
        this.map.get(firstKey)?.teardown();
        this.map.delete(firstKey);
    }
}

export function boundedRegistry<T extends Teardownable>(maxEntries: number): BoundedStoreRegistry<T> {
    return new BoundedStoreImpl<T>(maxEntries);
}
