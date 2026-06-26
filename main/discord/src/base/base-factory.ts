import { orThrow } from "../shared/nullable.js";

export abstract class BaseFactory<TKey, TInput, TOutput> {
    protected readonly creators = new Map<TKey, (input: TInput) => TOutput>();

    register(key: TKey, creator: (input: TInput) => TOutput): void {
        this.creators.set(key, creator);
    }

    create(key: TKey, input: TInput): TOutput {
        const creator = orThrow(this.creators.get(key), `BaseFactory: no creator registered for key=${String(key)}`);
        return creator(input);
    }

    has(key: TKey): boolean {
        return this.creators.has(key);
    }

    keys(): TKey[] {
        return [...this.creators.keys()];
    }
}
