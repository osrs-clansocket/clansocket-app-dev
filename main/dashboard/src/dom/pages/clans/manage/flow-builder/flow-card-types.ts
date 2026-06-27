import type { ConditionRow } from "../discord/modes/auto-hooks/condition-editor.js";

export type WaitUnit = "seconds" | "minutes" | "hours" | "days";
export type LoopIntervalUnit = "minutes" | "hours" | "days" | "weeks";
export type LoopOverlap = "skip" | "queue" | "cancel";
export type CardKind = "trigger" | "action" | "condition" | "delay" | "wait-for-event";

export interface ScheduleTriggerConfig {
    cronExpression: string;
    timezone: string;
}

export interface LoopTriggerConfig {
    intervalValue: number;
    intervalUnit: LoopIntervalUnit;
    onOverlap: LoopOverlap;
}

interface BaseCardConfig {
    readonly id: string;
    readonly kind: CardKind;
    name: string;
}

export interface TriggerCardConfig extends BaseCardConfig {
    readonly kind: "trigger";
    triggerType: string;
    conditions: readonly ConditionRow[];
    scheduleConfig: ScheduleTriggerConfig | null;
    loopConfig: LoopTriggerConfig | null;
}

export interface ActionCardConfig extends BaseCardConfig {
    readonly kind: "action";
    operationId: string;
    inputValues: Readonly<Record<string, unknown>>;
    openExits: readonly string[];
}

export interface ConditionCardConfig extends BaseCardConfig {
    readonly kind: "condition";
    conditions: readonly ConditionRow[];
}

export interface DelayCardConfig extends BaseCardConfig {
    readonly kind: "delay";
    waitValue: number | null;
    waitUnit: WaitUnit;
}

export interface WaitForEventCardConfig extends BaseCardConfig {
    readonly kind: "wait-for-event";
    eventTriggerId: string;
    timeoutMs: number | null;
}

export type FlowCardConfig =
    | TriggerCardConfig
    | ActionCardConfig
    | ConditionCardConfig
    | DelayCardConfig
    | WaitForEventCardConfig;

export interface FlowCardPlacement {
    readonly config: FlowCardConfig;
    readonly row: number;
    readonly col: number;
}

export interface FlowMeta {
    readonly id: string;
    name: string;
    enabled: boolean;
    loop: boolean;
    scheduleAtMs: number | null;
    placements: readonly FlowCardPlacement[];
}

export const WAIT_UNIT_MS: Readonly<Record<WaitUnit, number>> = {
    seconds: 1_000,
    minutes: 60_000,
    hours: 3_600_000,
    days: 86_400_000,
};
