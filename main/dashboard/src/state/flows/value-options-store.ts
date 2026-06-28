import { signal, type Signal } from "../../dom/factory";

interface Entry {
    readonly values: readonly string[];
    readonly fetchedAt: number;
}

const cache = new Map<string, Entry>();
const inflight = new Set<string>();
export const valueOptionsTick: Signal<number> = signal<number>(0);

function key(scope: string, triggerType: string, field: string): string {
    return `${scope}::${triggerType}::${field}`;
}

export function getValueOptions(scope: string, triggerType: string, field: string): readonly string[] {
    return cache.get(key(scope, triggerType, field))?.values ?? [];
}

export async function ensureValueOptions(
    scope: string,
    triggerType: string,
    field: string,
    clanId: string,
): Promise<void> {
    if (field.length === 0 || clanId.length === 0) return;
    const k = key(scope, triggerType, field);
    if (cache.has(k) || inflight.has(k)) return;
    inflight.add(k);
    try {
        const params = new URLSearchParams({ scope, field, clan_id: clanId });
        if (triggerType.length > 0) params.set("trigger_type", triggerType);
        const response = await fetch(`/api/flows/value-options?${params.toString()}`);
        if (!response.ok) return;
        const body = (await response.json()) as { values: readonly string[] };
        cache.set(k, { values: body.values ?? [], fetchedAt: Date.now() });
        valueOptionsTick.set(valueOptionsTick() + 1);
    } catch {
    } finally {
        inflight.delete(k);
    }
}
