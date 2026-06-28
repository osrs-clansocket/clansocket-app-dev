import type {
    FlowCardPlacement,
    FlowMeta,
    TriggerCardConfig,
} from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { conditionsToFilterDsl } from "./condition-dsl-bridge.js";
import { placementAt } from "./edge-serializer.js";
import {
    LOOP_TRIGGER_VALUE,
    MANUAL_TRIGGER_VALUE,
    SCHEDULE_TRIGGER_VALUE,
} from "./serializer-types.js";

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const DEFAULT_LOOP_INTERVAL_VALUE = 5;

const LOOP_UNIT_MS: Readonly<Record<string, number>> = {
    minutes: MS_PER_MINUTE,
    hours: MS_PER_HOUR,
    days: MS_PER_DAY,
    weeks: MS_PER_WEEK,
};

export type TriggerType = "event" | "manual" | "schedule" | "loop";

export function inferTriggerType(meta: FlowMeta): TriggerType {
    const entry = placementAt(meta.placements, 0, 0);
    if (entry && entry.config.kind === "trigger") {
        if (entry.config.triggerType === SCHEDULE_TRIGGER_VALUE) return "schedule";
        if (entry.config.triggerType === LOOP_TRIGGER_VALUE) return "loop";
        if (entry.config.triggerType === MANUAL_TRIGGER_VALUE) return "manual";
    }
    if (meta.loop) return "loop";
    if (meta.scheduleAtMs !== null) return "schedule";
    return "event";
}

export function entryNodeId(placements: readonly FlowCardPlacement[]): string {
    const entry = placementAt(placements, 0, 0);
    if (entry) return entry.config.id;
    return placements[0]?.config.id ?? "";
}

function scheduleConfig(cfg: TriggerCardConfig): Readonly<Record<string, unknown>> {
    const sc = cfg.scheduleConfig;
    return { cron_expression: sc?.cronExpression ?? "", timezone: sc?.timezone ?? "UTC" };
}

function loopConfig(cfg: TriggerCardConfig): Readonly<Record<string, unknown>> {
    const lc = cfg.loopConfig;
    const unit = lc?.intervalUnit ?? "minutes";
    const value = lc?.intervalValue ?? DEFAULT_LOOP_INTERVAL_VALUE;
    return {
        interval_value: value,
        interval_unit: unit,
        loop_interval_ms: value * (LOOP_UNIT_MS[unit] ?? LOOP_UNIT_MS.minutes!),
        on_overlap: lc?.onOverlap ?? "skip",
    };
}

function eventTriggerConfig(cfg: TriggerCardConfig): Readonly<Record<string, unknown>> {
    const triggerFilter = conditionsToFilterDsl(cfg.conditions);
    const out: Record<string, unknown> = { event_source: cfg.triggerType };
    if (triggerFilter) out.trigger_filter = triggerFilter;
    return out;
}

function entryTriggerConfig(cfg: TriggerCardConfig): Readonly<Record<string, unknown>> | null {
    if (cfg.triggerType === SCHEDULE_TRIGGER_VALUE) return scheduleConfig(cfg);
    if (cfg.triggerType === LOOP_TRIGGER_VALUE) return loopConfig(cfg);
    if (cfg.triggerType === MANUAL_TRIGGER_VALUE) return {};
    if (cfg.triggerType.length > 0) return eventTriggerConfig(cfg);
    return null;
}

export function triggerConfigFor(meta: FlowMeta): Readonly<Record<string, unknown>> {
    const entry = placementAt(meta.placements, 0, 0);
    if (entry && entry.config.kind === "trigger") {
        const cfg = entryTriggerConfig(entry.config);
        if (cfg) return cfg;
    }
    if (meta.loop) return { loop_interval_ms: MS_PER_MINUTE };
    if (meta.scheduleAtMs !== null) return { schedule_cron: "" };
    return {};
}
