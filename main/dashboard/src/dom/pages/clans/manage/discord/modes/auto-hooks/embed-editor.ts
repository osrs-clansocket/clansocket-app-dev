import { div, span, wireInput, type Instance, baseProps, textProps } from "../../../../../../factory";
import { glassInput } from "../../../../../../forms/glass/inputs/glass-input.js";
import { glassTextarea } from "../../../../../../forms/glass/inputs/glass-textarea.js";
import {
    AUTO_HOOKS_CARD_LABEL_CLASS,
    AUTO_HOOKS_CARD_ROW_CLASS,
    AUTO_HOOKS_CARD_VALUE_CLASS,
    AUTO_HOOKS_EMBED_EDITOR_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { buildEmbedSecondary } from "./embed-secondary.js";

const DEFAULT_EMBED_COLOR = "#5865F2";

import type { EmbedState, EmbedEditorCallbacks } from "./embed-editor-types.js";

export type { EmbedState, EmbedEditorCallbacks } from "./embed-editor-types.js";

export interface EmbedEditorExtras {
    buildDescAccessories?: (textareaEl: HTMLTextAreaElement) => readonly Instance[];
}

function buildRow(label: string, control: Instance): Instance {
    control.el.classList.add(AUTO_HOOKS_CARD_VALUE_CLASS);
    return div(baseProps([AUTO_HOOKS_CARD_ROW_CLASS]), [
        span(textProps([AUTO_HOOKS_CARD_LABEL_CLASS], label)),
        control,
    ]);
}

function buildTextInput(value: string, placeholder: string, ariaLabel: string, onValue: (v: string) => void): Instance {
    const inp = glassInput({
        value,
        placeholder,
        ariaLabel,
        context: `edit ${ariaLabel.toLowerCase()}`,
        meta: ["input"],
    });
    wireInput(inp.el, () => onValue(inp.el.value));
    return inp;
}

function buildEmbedDesc(value: string, onValue: (v: string) => void): Instance {
    const ta = glassTextarea({
        value,
        placeholder: "Embed description (supports {tokens} + markdown)",
        ariaLabel: "Embed description",
        context: "edit the embed description",
        meta: ["input"],
    });
    wireInput(ta.el, () => onValue(ta.el.value));
    return ta;
}

function buildTextRows(state: EmbedState, cb: EmbedEditorCallbacks): Instance[] {
    return [
        buildRow(
            "Title",
            buildTextInput(state.title, "Title (supports {tokens})", "Embed title", (v) => cb.onChange({ title: v })),
        ),
        buildRow(
            "Title URL",
            buildTextInput(state.url, "https://...", "Embed title URL", (v) => cb.onChange({ url: v })),
        ),
    ];
}

export function buildEmbedEditor(
    state: EmbedState,
    cb: EmbedEditorCallbacks,
    extras: EmbedEditorExtras = {},
): Instance {
    const descTextarea = buildEmbedDesc(state.description, (v) => cb.onChange({ description: v }));
    const accessories = extras.buildDescAccessories?.(descTextarea.el as HTMLTextAreaElement) ?? [];
    return div(baseProps([AUTO_HOOKS_EMBED_EDITOR_CLASS]), [
        ...buildTextRows(state, cb),
        buildRow("Description", descTextarea),
        ...accessories,
        ...buildEmbedSecondary(state, cb),
    ]);
}

export function defaultEmbedState(): EmbedState {
    return {
        title: "",
        description: "",
        color: DEFAULT_EMBED_COLOR,
        url: "",
        authorName: "",
        authorIconUrl: "",
        footerText: "",
        footerIconUrl: "",
        thumbnailUrl: "",
        imageUrl: "",
    };
}
