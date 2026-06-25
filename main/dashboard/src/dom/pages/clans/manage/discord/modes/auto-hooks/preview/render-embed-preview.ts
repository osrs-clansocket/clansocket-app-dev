import { div, type Instance } from "../../../../../../../factory";
import { sampleTokens } from "../../../../../../../../shared/constants/clan-manage-discord/token-list.js";
import {
    AUTO_HOOKS_PREVIEW_EMBED_BAR_CLASS,
    AUTO_HOOKS_PREVIEW_EMBED_CLASS,
} from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import type { PreviewState } from "./preview-state.js";
import { substitute } from "./render-embed-substitute.js";
import { buildEmbedAuthor, buildFooter } from "./embed-author-footer.js";
import { pushEmbedTitle, pushImages } from "./embed-title-images.js";

const DEFAULT_COLOR = "#5865F2";

export function renderEmbedPreview(state: PreviewState): Instance {
    const tokens = sampleTokens(state.triggerType);
    const bar = div({ classes: [AUTO_HOOKS_PREVIEW_EMBED_BAR_CLASS], context: null, meta: null });
    bar.el.style.backgroundColor = state.embedColor.length > 0 ? state.embedColor : DEFAULT_COLOR;
    const children: Instance[] = [bar];
    const author = buildEmbedAuthor(substitute(state.embedAuthorName, tokens), state.embedAuthorIconUrl);
    if (author !== null) children.push(author);
    pushEmbedTitle(children, state, tokens);
    pushImages(children, state);
    const footer = buildFooter(substitute(state.embedFooterText, tokens), state.embedFooterIconUrl);
    if (footer !== null) children.push(footer);
    return div({ classes: [AUTO_HOOKS_PREVIEW_EMBED_CLASS], context: null, meta: null }, children);
}
