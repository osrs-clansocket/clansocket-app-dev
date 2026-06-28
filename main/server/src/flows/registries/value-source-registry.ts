import { BaseRegistry } from "../../base/base-registry.js";

export interface ValueSourceItem {
    readonly id: string;
    readonly name: string;
    readonly kind?: string;
}

export type ValueSourceFetch = (clanId: string) => Promise<readonly ValueSourceItem[]>;

export interface RegisteredValueSource {
    readonly format: string;
    readonly label: string;
    readonly staticValues?: readonly ValueSourceItem[];
    readonly fetch?: ValueSourceFetch;
}

class ValueSourceRegistryStore extends BaseRegistry<string, RegisteredValueSource> {}

export const valueSourceRegistry = new ValueSourceRegistryStore();

export function registerValueSource(spec: RegisteredValueSource): void {
    valueSourceRegistry.registerUnique(
        spec.format,
        spec,
        (key) => new Error(`value source "${key}" already registered`),
    );
}

export async function resolveValueSource(format: string, clanId: string): Promise<readonly ValueSourceItem[]> {
    const spec = valueSourceRegistry.get(format);
    if (!spec) return [];
    if (spec.staticValues) return spec.staticValues;
    if (spec.fetch) return spec.fetch(clanId);
    return [];
}
