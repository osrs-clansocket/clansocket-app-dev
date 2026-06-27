import {
    div,
    span,
    button,
    baseProps,
    textProps,
    effect,
    BTN_VARIANT_OUTLINE,
    BTN_VARIANT_PRIMARY,
    type Instance,
} from "../../../../factory";
import { buildGlassCheck } from "../../../../forms/glass/inputs/glass-check.js";
import { glassDate } from "../../../../forms/glass/inputs/date/index.js";
import { glassInput } from "../../../../forms/glass/inputs/glass-input.js";
import {
    flowMetaSignal,
    setFlowName,
    setFlowEnabled,
    setFlowLoop,
    setFlowScheduleAtMs,
    persistCurrentToList,
} from "./flow-card-state.js";

const HEADER_CLASS = "clans-manage__flow-builder-header";
const SEGMENT_CLASS = "clans-manage__flow-builder-header-segment";
const LABEL_CLASS = "clans-manage__flow-builder-header-label";

function msToIsoDate(ms: number | null): string {
    if (ms === null) return "";
    const date = new Date(ms);
    const pad = (n: number): string => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isoDateToMs(iso: string): number | null {
    if (iso.length === 0) return null;
    const ms = Date.parse(`${iso}T00:00:00`);
    return Number.isFinite(ms) ? ms : null;
}

function buildNameField(): Instance {
    const inputEl = glassInput({
        value: flowMetaSignal().name,
        placeholder: "Flow name",
        ariaLabel: "Flow name",
        autocomplete: "off",
        onInput: (e) => setFlowName((e.target as HTMLInputElement).value),
    });
    effect(() => {
        const name = flowMetaSignal().name;
        const el = inputEl.el as HTMLInputElement;
        if (el.value !== name) el.value = name;
    });
    return div(baseProps([SEGMENT_CLASS]), [span(textProps([LABEL_CLASS], "Name")), inputEl]);
}

function buildEnabledToggle(): Instance {
    const toggle = buildGlassCheck({
        name: "flow-enabled",
        ariaLabel: "Enable flow",
        checked: () => flowMetaSignal().enabled,
        onChange: (next) => setFlowEnabled(next),
    });
    return div(baseProps([SEGMENT_CLASS]), [span(textProps([LABEL_CLASS], "Enabled")), toggle]);
}

function buildLoopToggle(): Instance {
    const toggle = buildGlassCheck({
        name: "flow-loop",
        ariaLabel: "Loop back to entry after completion",
        checked: () => flowMetaSignal().loop,
        onChange: (next) => setFlowLoop(next),
    });
    return div(baseProps([SEGMENT_CLASS]), [span(textProps([LABEL_CLASS], "Loop")), toggle]);
}

function buildScheduleField(): Instance {
    const picker = glassDate({
        name: "flow-schedule",
        value: msToIsoDate(flowMetaSignal().scheduleAtMs),
        placeholder: "pick a date",
        onChange: (iso) => setFlowScheduleAtMs(isoDateToMs(iso)),
    });
    return div(baseProps([SEGMENT_CLASS]), [span(textProps([LABEL_CLASS], "Schedule")), picker]);
}

function buildSaveButton(): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        text: "Save",
        context: "save the current flow draft",
        meta: ["action", "data"],
        onClick: () => persistCurrentToList(),
    });
}

function buildPublishButton(): Instance {
    return button({
        variant: BTN_VARIANT_PRIMARY,
        text: "Publish",
        context: "publish this flow",
        meta: ["action", "data"],
        onClick: () => persistCurrentToList(),
    });
}

export function buildFlowHeader(): Instance {
    return div(baseProps([HEADER_CLASS]), [
        buildNameField(),
        buildEnabledToggle(),
        buildLoopToggle(),
        buildScheduleField(),
        buildSaveButton(),
        buildPublishButton(),
    ]);
}
