import { div, image, span, type Instance, type ReactiveValue } from "../../../factory";
import {
    DISCORD_INSPECTOR_LABEL_ROW_CLASS,
    DISCORD_INSPECTOR_SECTION_CLASS,
    DISCORD_INSPECTOR_VALUE_CLASS,
    PANEL_LABEL_CLASS,
} from "../../../../shared/constants/clan-manage-discord/route-constants.js";
import { buildCopyButton } from "./builder-readonly-copy.js";

const IMAGE_PREVIEW_CLASS = "discord-inspector__image-preview";
export const NONE_VALUE = "—";

export interface ReadonlyEntry {
    title: string;
    value: ReactiveValue<string>;
}

export function buildLabelRow(title: string, trailing: Instance | null): Instance {
    const children: Instance[] = [span({ classes: [PANEL_LABEL_CLASS], text: title, context: null, meta: null })];
    if (trailing) children.push(trailing);
    return div({ classes: [DISCORD_INSPECTOR_LABEL_ROW_CLASS], context: null, meta: null }, children);
}

export function buildReadonlySection(e: ReadonlyEntry): Instance {
    return div({ classes: [DISCORD_INSPECTOR_SECTION_CLASS], context: null, meta: null }, [
        buildLabelRow(e.title, buildCopyButton(e)),
        span({ classes: [DISCORD_INSPECTOR_VALUE_CLASS], text: e.value, context: null, meta: null }),
    ]);
}

export function imagePreview(title: string, url: string | null): Instance {
    if (url === null || url.length === 0) {
        return buildReadonlySection({ title, value: NONE_VALUE });
    }
    const entry: ReadonlyEntry = { title, value: url };
    return div({ classes: [DISCORD_INSPECTOR_SECTION_CLASS], context: null, meta: null }, [
        buildLabelRow(title, buildCopyButton(entry)),
        image({ src: url, alt: title, classes: [IMAGE_PREVIEW_CLASS], context: null, meta: null }),
        span({ classes: [DISCORD_INSPECTOR_VALUE_CLASS], text: url, context: null, meta: null }),
    ]);
}
