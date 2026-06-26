import { div, image, span, type Instance, type ReactiveValue, baseProps, textProps } from "../../../factory";
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
    const children: Instance[] = [span(textProps([PANEL_LABEL_CLASS], title))];
    if (trailing) children.push(trailing);
    return div(baseProps([DISCORD_INSPECTOR_LABEL_ROW_CLASS]), children);
}

export function buildReadonlySection(e: ReadonlyEntry): Instance {
    return div(baseProps([DISCORD_INSPECTOR_SECTION_CLASS]), [
        buildLabelRow(e.title, buildCopyButton(e)),
        span(textProps([DISCORD_INSPECTOR_VALUE_CLASS], e.value)),
    ]);
}

export function imagePreview(title: string, url: string | null): Instance {
    if (url === null || url.length === 0) {
        return buildReadonlySection({ title, value: NONE_VALUE });
    }
    const entry: ReadonlyEntry = { title, value: url };
    return div(baseProps([DISCORD_INSPECTOR_SECTION_CLASS]), [
        buildLabelRow(title, buildCopyButton(entry)),
        image({ src: url, alt: title, classes: [IMAGE_PREVIEW_CLASS], context: null, meta: null }),
        span(textProps([DISCORD_INSPECTOR_VALUE_CLASS], url)),
    ]);
}
