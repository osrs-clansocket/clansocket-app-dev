import type {
    ActionCardConfig,
    CardKind,
    ConditionCardConfig,
    DelayCardConfig,
    FlowCardConfig,
    FlowMeta,
    TriggerCardConfig,
    WaitForEventCardConfig,
} from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { nextCardId, nextFlowId } from "./id-generator.js";

export function defaultTriggerCard(): TriggerCardConfig {
    return {
        id: nextCardId(),
        kind: "trigger",
        name: "Trigger",
        triggerType: "",
        conditions: [],
        scheduleConfig: null,
        loopConfig: null,
    };
}

export function defaultActionCard(): ActionCardConfig {
    return {
        id: nextCardId(),
        kind: "action",
        name: "Action",
        operationId: "",
        inputValues: {},
        openExits: [],
    };
}

export function defaultConditionCard(): ConditionCardConfig {
    return {
        id: nextCardId(),
        kind: "condition",
        name: "Condition",
        conditions: [],
    };
}

export function defaultDelayCard(): DelayCardConfig {
    return {
        id: nextCardId(),
        kind: "delay",
        name: "Delay",
        waitValue: null,
        waitUnit: "minutes",
    };
}

export function defaultWaitEvent(): WaitForEventCardConfig {
    return {
        id: nextCardId(),
        kind: "wait-for-event",
        name: "Wait for event",
        eventTriggerId: "",
        timeoutMs: null,
    };
}

const KIND_DEFAULTS: Readonly<Record<CardKind, () => FlowCardConfig>> = {
    "trigger": defaultTriggerCard,
    "action": defaultActionCard,
    "condition": defaultConditionCard,
    "delay": defaultDelayCard,
    "wait-for-event": defaultWaitEvent,
};

export function defaultCard(kind: CardKind): FlowCardConfig {
    return KIND_DEFAULTS[kind]();
}

export function defaultFlowMeta(): FlowMeta {
    return {
        id: nextFlowId(),
        name: "Untitled flow",
        enabled: false,
        loop: false,
        scheduleAtMs: null,
        placements: [{ config: defaultTriggerCard(), row: 0, col: 0 }],
    };
}
