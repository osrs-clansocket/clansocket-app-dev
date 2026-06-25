import { button, type Instance } from "../../../../factory/index.js";
import {
    TIMELINE_PANEL_KEYFRAME_BTN_CLASS,
    TIMELINE_PANEL_KEYFRAME_BTN_DANGER_MOD,
} from "../../../../../shared/constants/voxlab/voxlab-classes-constants.js";

export function buildActionBtn(label: string, tooltip: string, onClick: () => void): Instance<HTMLButtonElement> {
    return button({
        classes: [TIMELINE_PANEL_KEYFRAME_BTN_CLASS],
        type: "button",
        text: label,
        title: tooltip,
        ariaLabel: tooltip,
        context: `voxlab timeline keyframe action — ${tooltip.toLowerCase()}`,
        meta: ["action"],
        onClick,
    });
}

export function buildClearBtn(onClick: () => void): Instance<HTMLButtonElement> {
    return button({
        classes: [TIMELINE_PANEL_KEYFRAME_BTN_CLASS, TIMELINE_PANEL_KEYFRAME_BTN_DANGER_MOD],
        type: "button",
        text: "Clear all",
        title: "Wipe every keyframe from every track",
        ariaLabel: "Wipe every keyframe from every track",
        context: "voxlab timeline — clear every keyframe across every track",
        meta: ["destructive"],
        onClick,
    });
}

export function buildTrackingBtn(onClick: () => void): Instance<HTMLButtonElement> {
    return button({
        classes: [TIMELINE_PANEL_KEYFRAME_BTN_CLASS],
        type: "button",
        text: "Start tracking",
        title: "Begin recording scene-property changes as keyframes",
        ariaLabel: "Toggle keyframe tracking",
        context: "voxlab timeline — toggle keyframe tracking on/off",
        meta: ["action"],
        onClick,
    });
}
