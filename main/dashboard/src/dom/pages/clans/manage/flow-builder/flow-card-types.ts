import type { ConditionRow } from "../discord/modes/auto-hooks/condition-editor.js";

export type WaitUnit = "seconds" | "minutes" | "hours" | "days";

export interface FlowCardConfig {
    readonly id: string;
    triggerType: string;
    conditions: readonly ConditionRow[];
    waitValue: number | null;
    waitUnit: WaitUnit;
}

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
