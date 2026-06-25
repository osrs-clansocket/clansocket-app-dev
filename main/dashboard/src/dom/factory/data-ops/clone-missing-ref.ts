import { escapeHtml } from "./clone-escape.js";

const MISSING_CLASS = "ai-bar__missing-ref";

export function missingRef(key: string): string {
    return `<i class="${MISSING_CLASS}">Δ${escapeHtml(key)}Δ</i>`;
}
