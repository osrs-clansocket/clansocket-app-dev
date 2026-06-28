import { signal, type Signal } from "../../dom/factory/reactive/index.js";
import { readStored, writeStored } from "../persistence/index.js";
import type { FlowMeta } from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { defaultFlowMeta } from "./card-defaults.js";
import { nextCardId, nextFlowId, seedSequences } from "./id-generator.js";
import { migrateFlow } from "./flow-migrator.js";
import { compactFlow } from "./placement-compactor.js";

const STORAGE_KEY = "flow-builder.flows";

function loadStoredFlows(): readonly FlowMeta[] {
    const stored = readStored<readonly FlowMeta[]>(STORAGE_KEY);
    if (!stored || stored.length === 0) return [defaultFlowMeta()];
    return stored.map(migrateFlow).map(compactFlow);
}

function dedupeFlowIds(flows: readonly FlowMeta[]): readonly FlowMeta[] {
    const seenFlow = new Set<string>();
    return flows.map((flow) => {
        const flowId = seenFlow.has(flow.id) ? nextFlowId() : flow.id;
        seenFlow.add(flowId);
        const seenCard = new Set<string>();
        const cardIdRemap = new Map<string, string>();
        const placements = flow.placements.map((p) => {
            const cardId = seenCard.has(p.config.id) ? nextCardId() : p.config.id;
            seenCard.add(cardId);
            if (cardId !== p.config.id) cardIdRemap.set(p.config.id, cardId);
            if (cardId === p.config.id && flowId === flow.id) return p;
            return { ...p, config: { ...p.config, id: cardId } };
        });
        const edges = cardIdRemap.size === 0
            ? flow.edges
            : flow.edges.map((e) => {
                const fromRemap = cardIdRemap.get(e.from_node_id);
                const toRemap = cardIdRemap.get(e.to_node_id);
                if (!fromRemap && !toRemap) return e;
                return { ...e, from_node_id: fromRemap ?? e.from_node_id, to_node_id: toRemap ?? e.to_node_id };
            });
        return { ...flow, id: flowId, placements, edges };
    });
}

const rawStoredFlows = loadStoredFlows();
seedSequences(rawStoredFlows);
const storedFlows = dedupeFlowIds(rawStoredFlows);

export const flowMetaSignal: Signal<FlowMeta> = signal<FlowMeta>(storedFlows[0]!);
export const flowsListSignal: Signal<readonly FlowMeta[]> = signal<readonly FlowMeta[]>(storedFlows);

export function selectFlow(id: string): void {
    const found = flowsListSignal().find((f) => f.id === id);
    if (found) flowMetaSignal.set(found);
}

export function newFlow(): void {
    const fresh = defaultFlowMeta();
    const updated = [...flowsListSignal(), fresh];
    flowsListSignal.set(updated);
    flowMetaSignal.set(fresh);
    writeStored(STORAGE_KEY, updated);
}

export function persistCurrent(): void {
    const current = flowMetaSignal();
    const updated = flowsListSignal().map((f) => (f.id === current.id ? current : f));
    flowsListSignal.set(updated);
    writeStored(STORAGE_KEY, updated);
}

export async function saveToServer(clanId: string): Promise<{ ok: boolean; error?: string }> {
    persistCurrent();
    const current = flowMetaSignal();
    try {
        const { saveFlow } = await import("../flows/flows-client.js");
        const { serializeFlowDefinition } = await import("../flows/flow-serializer.js");
        const definition = serializeFlowDefinition(current);
        await saveFlow(clanId, current.id, current.name, definition);
        return { ok: true };
    } catch (err) {
        return { ok: false, error: (err as Error).message };
    }
}
