import { signal, type Signal } from "../../dom/factory";
import { dryRunFlow, type DryRunStep, type DryRunTrace } from "./flows-client.js";
import { serializeFlowDefinition } from "./flow-serializer.js";
import { flowMetaSignal } from "../flow-builder/flow-store.js";

export const dryRunTraceSignal: Signal<DryRunTrace | null> = signal<DryRunTrace | null>(null);
export const dryRunErrorSignal: Signal<string | null> = signal<string | null>(null);

export async function runDryRunForCurrent(clanId: string): Promise<void> {
    dryRunErrorSignal.set(null);
    try {
        const definition = serializeFlowDefinition(flowMetaSignal());
        const response = await dryRunFlow(definition, clanId);
        dryRunTraceSignal.set(response.trace);
    } catch (err) {
        dryRunErrorSignal.set((err as Error).message);
        dryRunTraceSignal.set(null);
    }
}

export function clearDryRunTrace(): void {
    dryRunTraceSignal.set(null);
    dryRunErrorSignal.set(null);
}

export function decisionForNode(nodeId: string): DryRunStep["decision"] | null {
    const trace = dryRunTraceSignal();
    if (!trace) return null;
    const step = trace.steps.find((s) => s.node_id === nodeId);
    return step ? step.decision : null;
}
