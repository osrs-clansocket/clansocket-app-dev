import { div, paragraph, span, type Instance, baseProps, textProps } from "../../../../../../../factory";
import { sampleTokens } from "../../../../../../../../shared/constants/clan-manage-discord/token-list.js";
import {
    AUTO_HOOKS_PREVIEW_CONTENT_CLASS,
    AUTO_HOOKS_PREVIEW_USERNAME_CLASS,
} from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import type { PreviewState } from "./preview-state.js";
import { renderMarkdownNodes } from "./render-markdown/render-markdown.js";

const DEFAULT_USERNAME = "Webhook";

function substituteTokens(template: string, tokenMap: Record<string, string>): string {
    let result = template;
    for (const [token, value] of Object.entries(tokenMap)) {
        result = result.split(token).join(value);
    }
    return result;
}

export function renderContentPreview(state: PreviewState): Instance {
    const tokenMap = sampleTokens(state.triggerType);
    const substituted = substituteTokens(state.content, tokenMap);
    const contentNodes = renderMarkdownNodes(substituted);
    return div(baseProps([]), [
        span(textProps([AUTO_HOOKS_PREVIEW_USERNAME_CLASS], state.name.length > 0 ? state.name : DEFAULT_USERNAME)),
        paragraph(
            {
                classes: [AUTO_HOOKS_PREVIEW_CONTENT_CLASS],
                context: null,
                meta: null,
            },
            contentNodes,
        ),
    ]);
}
