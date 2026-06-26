import { div, span, wireInput, type Instance, baseProps, textProps } from "../../../../../../factory";
import { glassInput } from "../../../../../../forms/glass/inputs/glass-input.js";
import { buildGlassColor } from "../../../../../../forms/glass/inputs/color/index.js";
import {
    AUTO_HOOKS_CARD_LABEL_CLASS,
    AUTO_HOOKS_CARD_ROW_CLASS,
    AUTO_HOOKS_CARD_VALUE_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import type { EmbedEditorCallbacks, EmbedState } from "./embed-editor-types.js";

const DEFAULT_EMBED_COLOR = "#5865F2";

interface EmbedSecondarySpec {
    label: string;
    value: (s: EmbedState) => string;
    placeholder: string;
    aria: string;
    set: (cb: EmbedEditorCallbacks, v: string) => void;
}

const SECONDARY_FIELDS: ReadonlyArray<EmbedSecondarySpec> = [
    {
        label: "Author",
        value: (s) => s.authorName,
        placeholder: "Author name",
        aria: "Author name",
        set: (cb, v) => cb.onChange({ authorName: v }),
    },
    {
        label: "Author icon",
        value: (s) => s.authorIconUrl,
        placeholder: "https://... (icon URL)",
        aria: "Author icon URL",
        set: (cb, v) => cb.onChange({ authorIconUrl: v }),
    },
    {
        label: "Footer",
        value: (s) => s.footerText,
        placeholder: "Footer text",
        aria: "Footer text",
        set: (cb, v) => cb.onChange({ footerText: v }),
    },
    {
        label: "Footer icon",
        value: (s) => s.footerIconUrl,
        placeholder: "https://... (icon URL)",
        aria: "Footer icon URL",
        set: (cb, v) => cb.onChange({ footerIconUrl: v }),
    },
    {
        label: "Thumbnail",
        value: (s) => s.thumbnailUrl,
        placeholder: "https://... (top-right small image)",
        aria: "Thumbnail URL",
        set: (cb, v) => cb.onChange({ thumbnailUrl: v }),
    },
    {
        label: "Image",
        value: (s) => s.imageUrl,
        placeholder: "https://... (large bottom image)",
        aria: "Image URL",
        set: (cb, v) => cb.onChange({ imageUrl: v }),
    },
];

function rowOf(label: string, control: Instance): Instance {
    control.el.classList.add(AUTO_HOOKS_CARD_VALUE_CLASS);
    return div(baseProps([AUTO_HOOKS_CARD_ROW_CLASS]), [
        span(textProps([AUTO_HOOKS_CARD_LABEL_CLASS], label)),
        control,
    ]);
}

function textInputOf(value: string, placeholder: string, ariaLabel: string, onValue: (v: string) => void): Instance {
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

function colorPickerOf(state: EmbedState, onValue: (v: string) => void): Instance {
    return buildGlassColor({
        name: "embed-color",
        value: () => (state.color.length > 0 ? state.color : DEFAULT_EMBED_COLOR),
        ariaLabel: "Embed color",
        onChange: onValue,
    });
}

export function buildEmbedSecondary(state: EmbedState, cb: EmbedEditorCallbacks): Instance[] {
    const rows: Instance[] = [
        rowOf(
            "Color",
            colorPickerOf(state, (v) => cb.onChange({ color: v })),
        ),
    ];
    for (const f of SECONDARY_FIELDS) {
        rows.push(
            rowOf(
                f.label,
                textInputOf(f.value(state), f.placeholder, f.aria, (v) => f.set(cb, v)),
            ),
        );
    }
    return rows;
}
