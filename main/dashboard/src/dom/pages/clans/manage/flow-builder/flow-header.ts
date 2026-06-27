import {
    div,
    span,
    input,
    button,
    baseProps,
    textProps,
    wireInput,
    wireClick,
    effect,
    BTN_VARIANT_BARE,
    type Instance,
} from "../../../../factory";
import { buildGlassCheck } from "../../../../forms/glass/inputs/glass-check.js";
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
const NAME_INPUT_CLASS = "clans-manage__flow-builder-header-name";
const SCHEDULE_INPUT_CLASS = "clans-manage__flow-builder-header-schedule";
const BTN_CLASS = "clans-manage__flow-builder-header-btn";
const BTN_PRIMARY_CLASS = "clans-manage__flow-builder-header-btn--primary";

function msToDatetimeLocal(ms: number | null): string {
    if (ms === null) return "";
    const date = new Date(ms);
    const pad = (n: number): string => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function datetimeLocalToMs(value: string): number | null {
    if (value.length === 0) return null;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
}

function buildNameField(): Instance {
    const inputEl = input({
        name: "flow-name",
        type: "text",
        classes: [NAME_INPUT_CLASS, "glass-input"],
        value: flowMetaSignal().name,
        ariaLabel: "Flow name",
        context: "the display name for this flow",
        meta: ["input"],
    });
    wireInput(inputEl.el, () => setFlowName(inputEl.el.value));
    effect(() => {
        const name = flowMetaSignal().name;
        if (inputEl.el.value !== name) inputEl.el.value = name;
    });
    return div(baseProps([SEGMENT_CLASS]), [
        span(textProps([LABEL_CLASS], "Name")),
        inputEl,
    ]);
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

function buildSchedulePicker(): Instance {
    const inputEl = input({
        name: "flow-schedule",
        type: "datetime-local",
        classes: [SCHEDULE_INPUT_CLASS, "glass-input"],
        value: msToDatetimeLocal(flowMetaSignal().scheduleAtMs),
        ariaLabel: "Schedule date and time",
        context: "first time this flow fires; db-canonical",
        meta: ["input"],
    });
    wireInput(inputEl.el, () => setFlowScheduleAtMs(datetimeLocalToMs(inputEl.el.value)));
    effect(() => {
        const next = msToDatetimeLocal(flowMetaSignal().scheduleAtMs);
        if (inputEl.el.value !== next) inputEl.el.value = next;
    });
    return div(baseProps([SEGMENT_CLASS]), [span(textProps([LABEL_CLASS], "Schedule")), inputEl]);
}

function buildSaveButton(): Instance {
    const btn = button(
        {
            classes: [BTN_CLASS],
            ariaLabel: "Save draft",
            context: "save the current flow draft",
            meta: ["action"],
        },
        ["Save"],
    );
    wireClick(btn.el, () => persistCurrentToList());
    return btn;
}

function buildPublishButton(): Instance {
    const btn = button(
        {
            classes: [BTN_CLASS, BTN_PRIMARY_CLASS],
            variant: BTN_VARIANT_BARE,
            ariaLabel: "Publish flow",
            context: "publish this flow",
            meta: ["action"],
        },
        ["Publish"],
    );
    wireClick(btn.el, () => persistCurrentToList());
    return btn;
}

export function buildFlowHeader(): Instance {
    return div(baseProps([HEADER_CLASS]), [
        buildNameField(),
        buildEnabledToggle(),
        buildLoopToggle(),
        buildSchedulePicker(),
        buildSaveButton(),
        buildPublishButton(),
    ]);
}
