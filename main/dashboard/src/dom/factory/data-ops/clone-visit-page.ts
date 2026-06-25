import { escapeHtml } from "./clone-escape.js";

const VISIT_PAGE_CLASS = "ai-bar__visit-page";
const VISIT_PAGE_LABEL = "Visit page";
const CLONED_KEY_ATTR = "data-ai-clone";

export function visitPagePlaceholder(deepLink: string, key: string): string {
    return `<a class="${VISIT_PAGE_CLASS}" href="${escapeHtml(deepLink)}" data-route ${CLONED_KEY_ATTR}="${escapeHtml(key)}">${VISIT_PAGE_LABEL}</a>`;
}
