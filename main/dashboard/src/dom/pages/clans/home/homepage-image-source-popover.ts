import { BTN_VARIANT_OUTLINE, button, div, input, span, type Instance, baseProps, textProps } from "../../../factory";
import { uploadHomepageImage } from "../../../../state/clans/homepage/homepage-client.js";
import { isDefaultIconKey } from "../../../../state/clans/homepage/homepage-default-scaffold.js";
import type { EditorState } from "./homepage-editor-state.js";
import { popoverCloseBtn } from "./homepage-popover-close.js";

const POPOVER_CLASS = "clans-home__img-source";
const HEAD_CLASS = "clans-home__img-source-head";
const ROW_CLASS = "clans-home__img-source-row";
const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

function buildHiddenInput(state: EditorState, id: string): Instance<HTMLInputElement> {
    const picker: Instance<HTMLInputElement> = input({
        classes: ["clans-home__edit-image-picker"],
        type: "file",
        accept: IMAGE_ACCEPT,
        ariaLabel: "Upload replacement image",
        context: "upload a replacement image for the selected image component",
        meta: ["input"],
        onChange: async () => {
            const file = picker.el.files?.[0];
            if (!file) return;
            const result = await uploadHomepageImage(state.slug, file);
            if (result.ok && typeof result.key === "string" && typeof result.version === "number") {
                state.updateImage(id, result.key, result.version);
            }
            picker.el.value = "";
        },
    });
    return picker;
}

export function buildImageSourcePopover(state: EditorState, id: string, onClose: () => void): Instance {
    const picker = buildHiddenInput(state, id);
    const comp = state.draft$().find((c) => c.componentId === id);
    const currentKey = comp?.payload.imageKey;
    return div(baseProps([POPOVER_CLASS]), [
        div(baseProps([HEAD_CLASS]), [
            span(textProps(["clans-home__img-source-label"], "Image source")),
            popoverCloseBtn(onClose),
        ]),
        div(baseProps([ROW_CLASS]), [
            button({
                variant: BTN_VARIANT_OUTLINE,
                text: isDefaultIconKey(currentKey) ? "✓ Clan icon" : "Use clan icon",
                ariaLabel: "Use this clan's icon",
                context: "use the clan's branding icon as this image",
                meta: ["action"],
                onClick: () => state.updateImage(id, "__clan_icon__", 0),
            }),
        ]),
        div(baseProps([ROW_CLASS]), [
            button({
                variant: BTN_VARIANT_OUTLINE,
                text: "Upload new",
                ariaLabel: "Upload a replacement image",
                context: "upload a replacement image from disk",
                meta: ["action"],
                onClick: () => picker.el.click(),
            }),
            picker,
        ]),
    ]);
}
