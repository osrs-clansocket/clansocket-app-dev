export class BaseRegistry<TKey, TValue> {
    protected readonly entries = new Map<TKey, TValue>();

    get(key: TKey): TValue | null {
        return this.entries.get(key) ?? null;
    }

    has(key: TKey): boolean {
        return this.entries.has(key);
    }

    list(): TValue[] {
        return [...this.entries.values()];
    }

    keys(): TKey[] {
        return [...this.entries.keys()];
    }

    size(): number {
        return this.entries.size;
    }

    register(key: TKey, value: TValue): void {
        this.entries.set(key, value);
    }

    registerUnique(key: TKey, value: TValue, onDuplicate: (key: TKey) => Error): void {
        if (this.entries.has(key)) throw onDuplicate(key);
        this.entries.set(key, value);
    }

    unregister(key: TKey): boolean {
        return this.entries.delete(key);
    }

    clear(): void {
        this.entries.clear();
    }
}
