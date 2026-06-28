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

const DECISION_PRIORITY: Readonly<Record<DryRunStep["decision"], number>> = {
    "would-fail": 4,
    "would-fire": 3,
    "would-pause": 2,
    "would-skip": 1,
};

export function decisionForNode(nodeId: string): DryRunStep["decision"] | null {
    const trace = dryRunTraceSignal();
    if (!trace) return null;
    let best: DryRunStep["decision"] | null = null;
    let bestPriority = 0;
    for (const step of trace.steps) {
        if (step.node_id !== nodeId) continue;
        const p = DECISION_PRIORITY[step.decision] ?? 0;
        if (p > bestPriority) {
            bestPriority = p;
            best = step.decision;
        }
    }
    return best;
}
