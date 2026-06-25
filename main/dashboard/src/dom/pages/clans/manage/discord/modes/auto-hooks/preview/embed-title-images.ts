import { paragraph, type Instance } from "../../../../../../../factory";
import {
    AUTO_HOOKS_PREVIEW_EMBED_DESC_CLASS,
    AUTO_HOOKS_PREVIEW_EMBED_TITLE_CLASS,
} from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import type { PreviewState } from "./preview-state.js";
import { renderMarkdownNodes } from "./render-markdown/render-markdown.js";
import { maybeImage, substitute } from "./render-embed-substitute.js";

export function pushEmbedTitle(children: Instance[], state: PreviewState, tokens: Record<string, string>): void {
    if (state.embedTitle.length > 0) {
        const title = paragraph(
            { classes: [AUTO_HOOKS_PREVIEW_EMBED_TITLE_CLASS], context: null, meta: null },
            renderMarkdownNodes(substitute(state.embedTitle, tokens)),
        );
        if (state.embedUrl.length > 0) title.el.style.color = "var(--base-gold-300)";
        children.push(title);
    }
    if (state.embedDescription.length > 0) {
        children.push(
            paragraph(
                { classes: [AUTO_HOOKS_PREVIEW_EMBED_DESC_CLASS], context: null, meta: null },
                renderMarkdownNodes(substitute(state.embedDescription, tokens)),
            ),
        );
    }
}

export function pushImages(children: Instance[], state: PreviewState): void {
    const thumb = maybeImage(state.embedThumbnailUrl, "thumbnail", (el) => {
        el.style.position = "absolute";
        el.style.insetInlineEnd = "0.5rem";
        el.style.insetBlockStart = "0.5rem";
        el.style.inlineSize = "3rem";
        el.style.blockSize = "3rem";
        el.style.borderRadius = "var(--radius-sm)";
    });
    if (thumb !== null) children.push(thumb);
    const mainImg = maybeImage(state.embedImageUrl, "embed image", (el) => {
        el.style.maxInlineSize = "100%";
        el.style.borderRadius = "var(--radius-sm)";
    });
    if (mainImg !== null) children.push(mainImg);
}
