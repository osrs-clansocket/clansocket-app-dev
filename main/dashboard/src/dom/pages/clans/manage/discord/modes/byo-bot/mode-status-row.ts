import { div, span, type Instance } from "../../../../../../factory";
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
    return div({ classes: [DISCORD_INSPECTOR_LABEL_ROW_CLASS], context: null, meta: null }, [
        span({ classes: [PANEL_LABEL_CLASS], text: label, context: null, meta: null }),
    ]);
}

export function statusRow(label: string, value: string): Instance {
    return div({ classes: [DISCORD_INSPECTOR_SECTION_CLASS], context: null, meta: null }, [
        statusInspectorRow(label),
        span({ classes: [DISCORD_INSPECTOR_VALUE_CLASS], text: value, context: null, meta: null }),
    ]);
}
