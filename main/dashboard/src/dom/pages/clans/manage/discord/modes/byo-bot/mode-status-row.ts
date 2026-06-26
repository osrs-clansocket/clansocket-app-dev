import { div, span, type Instance, baseProps, textProps } from "../../../../../../factory";
import {
    DISCORD_INSPECTOR_LABEL_ROW_CLASS,
    DISCORD_INSPECTOR_SECTION_CLASS,
    DISCORD_INSPECTOR_VALUE_CLASS,
    PANEL_LABEL_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";

const NONE_VALUE = "—";
const ISO_DATE_END = 10;

export function formatDate(ms: number | null): string {
    if (ms === null) return NONE_VALUE;
    return new Date(ms).toISOString().slice(0, ISO_DATE_END);
}

export function statusInspectorRow(label: string): Instance {
    return div(baseProps([DISCORD_INSPECTOR_LABEL_ROW_CLASS]), [span(textProps([PANEL_LABEL_CLASS], label))]);
}

export function statusRow(label: string, value: string): Instance {
    return div(baseProps([DISCORD_INSPECTOR_SECTION_CLASS]), [
        statusInspectorRow(label),
        span(textProps([DISCORD_INSPECTOR_VALUE_CLASS], value)),
    ]);
}
