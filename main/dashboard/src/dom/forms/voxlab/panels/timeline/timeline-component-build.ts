import { button, div, input, span, type Instance } from "../../../../factory/index.js";
import {
    CONTROL_SLIDER_CLASS,
    TIMELINE_PANEL_BTN_CLASS,
    TIMELINE_PANEL_BTN_LOOP_MOD,
    TIMELINE_PANEL_BUTTONS_CLASS,
    TIMELINE_PANEL_READOUT_CLASS,
    TIMELINE_PANEL_SCRUBBER_CLASS,
    TIMELINE_PANEL_TRANSPORT_CLASS,
} from "../../../../../shared/constants/voxlab/voxlab-classes-constants.js";
import {
    SCRUB_MAX,
    TRANSPORT_BUTTONS,
    type TimelineSource,
    type TransportButtonSpec,
} from "./timeline-component-types.js";

export { buildActionBtn, buildClearBtn, buildTrackingBtn } from "./timeline-panel-actions.js";

export function buildTransportButton(
    spec: TransportButtonSpec,
    getSource: () => TimelineSource | null,
): Instance<HTMLButtonElement> {
    const modClass = spec.modifier === "loop" ? TIMELINE_PANEL_BTN_LOOP_MOD : null;
    const classes = modClass ? [TIMELINE_PANEL_BTN_CLASS, modClass] : [TIMELINE_PANEL_BTN_CLASS];
    const btn = button({
        classes,
        type: "button",
        title: spec.label,
        ariaLabel: spec.label,
        context: `voxlab timeline transport — ${spec.label.toLowerCase()}`,
        meta: ["action"],
        onClick: () => {
            const s = getSource();
            if (s) spec.onClick(s);
        },
    });
    // eslint-disable-next-line lvi/no-raw-dom
    btn.el.innerHTML = spec.icon;
    return btn;
}

export interface TransportKit {
    transport: Instance;
    timeReadout: Instance;
    play: Instance<HTMLButtonElement>;
    loop: Instance<HTMLButtonElement>;
    smoothing: Instance<HTMLButtonElement>;
}

type TransportRole = "play" | "loop" | "smoothing";
const TRANSPORT_ROLES: ReadonlySet<TransportRole> = new Set(["play", "loop", "smoothing"]);

export function buildTransport(getSource: () => TimelineSource | null): TransportKit {
    const bindings: Partial<Record<TransportRole, Instance<HTMLButtonElement>>> = {};
    const buttonEls: HTMLElement[] = [];
    for (const spec of TRANSPORT_BUTTONS) {
        const btn = buildTransportButton(spec, getSource);
        if (TRANSPORT_ROLES.has(spec.modifier as TransportRole)) bindings[spec.modifier as TransportRole] = btn;
        buttonEls.push(btn.el);
    }
    const { play, loop, smoothing } = bindings as Record<TransportRole, Instance<HTMLButtonElement>>;
    const buttonRow = div({ classes: [TIMELINE_PANEL_BUTTONS_CLASS], context: null, meta: null }, buttonEls);
    const timeReadout = span({
        classes: [TIMELINE_PANEL_READOUT_CLASS],
        text: "0.00s / 0.00s",
        context: null,
        meta: null,
    });
    const transport = div({ classes: [TIMELINE_PANEL_TRANSPORT_CLASS], context: null, meta: null }, [
        buttonRow.el,
        timeReadout.el,
    ]);
    return { transport, timeReadout, play, loop, smoothing };
}

export function buildScrubber(onInputValue: (raw: number) => void): Instance<HTMLInputElement> {
    const scrubber = input({
        classes: [CONTROL_SLIDER_CLASS, TIMELINE_PANEL_SCRUBBER_CLASS],
        type: "range",
        min: "0",
        max: String(SCRUB_MAX),
        step: "1",
        value: "0",
        ariaLabel: "timeline scrubber",
        context: "voxlab timeline scrubber — drag to seek through the timeline",
        meta: ["input"],
        onInput: () => onInputValue(Number.parseFloat(scrubber.el.value)),
    });
    return scrubber;
}
