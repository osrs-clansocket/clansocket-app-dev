import { signal, type Signal } from "../../dom/factory";
import { fetchCapabilities, type CapabilitySummary } from "./flows-client.js";

export const capabilitiesSignal: Signal<readonly CapabilitySummary[]> = signal<readonly CapabilitySummary[]>([]);

let loaded = false;

export async function ensureCapabilitiesLoaded(): Promise<void> {
    if (loaded) return;
    loaded = true;
    try {
        const response = await fetchCapabilities();
        capabilitiesSignal.set(response.capabilities);
    } catch {
        loaded = false;
    }
}

export interface TriggerOption {
    readonly value: string;
    readonly label: string;
    readonly group: string;
}

export function flatTriggerOptions(): readonly TriggerOption[] {
    const options: TriggerOption[] = [];
    for (const capability of capabilitiesSignal()) {
        for (const [triggerId, spec] of Object.entries(capability.triggers)) {
            if (!spec.triggerable) continue;
            options.push({ value: triggerId, label: triggerId, group: capability.name });
        }
    }
    return options;
}
