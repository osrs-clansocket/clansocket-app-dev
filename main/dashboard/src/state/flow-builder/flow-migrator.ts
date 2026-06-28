import type {
    ActionCardConfig,
    CardKind,
    ConditionCardConfig,
    DelayCardConfig,
    FlowCardConfig,
    FlowEdge,
    FlowMeta,
    TriggerCardConfig,
    WaitForEventCardConfig,
} from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { nextCardId } from "./id-generator.js";
import { deriveEdgesFromGrid } from "./legacy-edge-derivation.js";

type RawCard = Partial<FlowCardConfig> & Record<string, unknown>;

function pickKind(o: RawCard, isEntry: boolean): CardKind {
    if (typeof o.kind === "string") return o.kind as CardKind;
    return isEntry ? "trigger" : "condition";
}

function pickName(o: RawCard, kind: CardKind): string {
    if (typeof o.name === "string") return o.name;
    if (kind === "trigger") return "Trigger";
    if (kind === "action") return "Action";
    return "Node";
}

function migrateTrigger(o: RawCard, id: string, name: string): TriggerCardConfig {
    const sc = (o as { scheduleConfig?: TriggerCardConfig["scheduleConfig"] }).scheduleConfig;
    const lc = (o as { loopConfig?: TriggerCardConfig["loopConfig"] }).loopConfig;
    return {
        id,
        name,
        kind: "trigger",
        triggerType: typeof o.triggerType === "string" ? o.triggerType : "",
        conditions: Array.isArray(o.conditions) ? (o.conditions as TriggerCardConfig["conditions"]) : [],
        scheduleConfig: sc && typeof sc === "object" ? sc : null,
        loopConfig: lc && typeof lc === "object" ? lc : null,
    };
}

function migrateAction(o: RawCard, id: string, name: string): ActionCardConfig {
    return {
        id,
        name,
        kind: "action",
        operationId: typeof o.operationId === "string" ? o.operationId : "",
        inputValues: (o.inputValues as Record<string, unknown>) ?? {},
        openExits: Array.isArray(o.openExits) ? (o.openExits as readonly string[]) : [],
    };
}

function migrateDelay(o: RawCard, id: string, name: string): DelayCardConfig {
    return {
        id,
        name,
        kind: "delay",
        waitValue: typeof o.waitValue === "number" ? o.waitValue : null,
        waitUnit: (o.waitUnit as DelayCardConfig["waitUnit"]) ?? "minutes",
    };
}

function migrateWaitEvent(o: RawCard, id: string, name: string): WaitForEventCardConfig {
    return {
        id,
        name,
        kind: "wait-for-event",
        eventTriggerId: typeof o.eventTriggerId === "string" ? o.eventTriggerId : "",
        timeoutMs: typeof o.timeoutMs === "number" ? o.timeoutMs : null,
    };
}

function migrateCondition(o: RawCard, id: string, name: string): ConditionCardConfig {
    return {
        id,
        name,
        kind: "condition",
        conditions: Array.isArray(o.conditions) ? (o.conditions as ConditionCardConfig["conditions"]) : [],
    };
}

const MIGRATORS: Readonly<Record<CardKind, (o: RawCard, id: string, name: string) => FlowCardConfig>> = {
    trigger: migrateTrigger,
    action: migrateAction,
    delay: migrateDelay,
    "wait-for-event": migrateWaitEvent,
    condition: migrateCondition,
};

export function migrateCardConfig(raw: unknown, isEntry: boolean): FlowCardConfig {
    const o = raw as RawCard;
    const kind = pickKind(o, isEntry);
    const id = typeof o.id === "string" ? o.id : nextCardId();
    const name = pickName(o, kind);
    const migrator = MIGRATORS[kind] ?? migrateCondition;
    return migrator(o, id, name);
}

function migrateEdges(flow: FlowMeta, placements: readonly FlowMeta["placements"][number][]): readonly FlowEdge[] {
    const raw = (flow as { edges?: unknown }).edges;
    if (Array.isArray(raw)) {
        const out: FlowEdge[] = [];
        for (const e of raw) {
            const edge = e as Partial<FlowEdge>;
            if (typeof edge.id !== "string") continue;
            if (typeof edge.from_node_id !== "string") continue;
            if (typeof edge.from_handle_id !== "string") continue;
            if (typeof edge.to_node_id !== "string") continue;
            out.push({
                id: edge.id,
                from_node_id: edge.from_node_id,
                from_handle_id: edge.from_handle_id,
                to_node_id: edge.to_node_id,
            });
        }
        return out;
    }
    return deriveEdgesFromGrid(placements);
}

export function migrateFlow(flow: FlowMeta): FlowMeta {
    const placements = flow.placements.map((p, idx) => {
        const isEntry = idx === 0 || (p.row === 0 && p.col === 0);
        return { ...p, config: migrateCardConfig(p.config, isEntry) };
    });
    const edges = migrateEdges(flow, placements);
    return { ...flow, placements, edges };
}
