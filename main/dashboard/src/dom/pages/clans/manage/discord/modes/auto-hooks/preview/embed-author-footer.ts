import { div, span, type Instance } from "../../../../../../../factory";
import { renderMarkdownNodes } from "./render-markdown/render-markdown.js";
import { maybeImage } from "./render-embed-substitute.js";

export function buildEmbedAuthor(name: string, iconUrl: string): Instance | null {
    if (name.length === 0 && iconUrl.length === 0) return null;
    const children: Instance[] = [];
    const icon = maybeImage(iconUrl, "author icon", (el) => {
        el.style.inlineSize = "1rem";
        el.style.blockSize = "1rem";
        el.style.borderRadius = "50%";
        el.style.verticalAlign = "middle";
        el.style.marginInlineEnd = "0.25rem";
    });
    if (icon !== null) children.push(icon);
    if (name.length > 0) {
        const nameWrap = span({ classes: [], context: null, meta: null }, renderMarkdownNodes(name));
        children.push(nameWrap);
    }
    const wrap = div({ classes: [], context: null, meta: null }, children);
    wrap.el.style.fontSize = "var(--fs-3xs)";
    wrap.el.style.color = "var(--base-cream-100)";
    return wrap;
}

export function buildFooter(text: string, iconUrl: string): Instance | null {
    if (text.length === 0 && iconUrl.length === 0) return null;
    const children: Instance[] = [];
    const icon = maybeImage(iconUrl, "footer icon", (el) => {
        el.style.inlineSize = "0.75rem";
        el.style.blockSize = "0.75rem";
        el.style.borderRadius = "50%";
        el.style.verticalAlign = "middle";
        el.style.marginInlineEnd = "0.25rem";
    });
    if (icon !== null) children.push(icon);
    if (text.length > 0) {
        const textWrap = span({ classes: [], context: null, meta: null }, renderMarkdownNodes(text));
        children.push(textWrap);
    }
    const wrap = div({ classes: [], context: null, meta: null }, children);
    wrap.el.style.fontSize = "var(--fs-3xs)";
    wrap.el.style.color = "var(--base-graphite-300)";
    wrap.el.style.paddingBlockStart = "0.25rem";
    return wrap;
}
