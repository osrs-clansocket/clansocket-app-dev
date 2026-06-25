import { image, span, type Instance } from "../../../../../../../factory";
import {
    MD_BOLD_CLASS,
    MD_BR_CLASS,
    MD_CODE_CLASS,
    MD_ITALIC_CLASS,
    MD_LINK_CLASS,
    MD_TEXT_CLASS,
    type Node,
} from "../../../../../../../../state/discord/auto-hooks/preview/render-markdown/render-markdown-types.js";

function buildEmojiNode(n: Extract<Node, { kind: "emoji" }>): Instance {
    const url = n.url ?? `https://cdn.discordapp.com/emojis/${n.id}.${n.animated ? "gif" : "webp"}`;
    const img = image({ src: url, alt: `:${n.name}:`, classes: [], context: null, meta: null });
    img.el.style.display = "inline-block";
    img.el.style.inlineSize = "1.375em";
    img.el.style.blockSize = "1.375em";
    img.el.style.verticalAlign = "middle";
    img.el.style.objectFit = "contain";
    img.setAttr("title", `:${n.name}:`);
    return img;
}

export function nodeToInstance(n: Node): Instance {
    if (n.kind === "text") return span({ classes: [MD_TEXT_CLASS], text: n.text, context: null, meta: null });
    if (n.kind === "bold") return span({ classes: [MD_BOLD_CLASS], text: n.text, context: null, meta: null });
    if (n.kind === "italic") return span({ classes: [MD_ITALIC_CLASS], text: n.text, context: null, meta: null });
    if (n.kind === "code") return span({ classes: [MD_CODE_CLASS], text: n.text, context: null, meta: null });
    if (n.kind === "link") {
        const s = span({ classes: [MD_LINK_CLASS], text: n.text, context: null, meta: null });
        s.setAttr("title", n.url);
        return s;
    }
    if (n.kind === "emoji") return buildEmojiNode(n);
    return span({ classes: [MD_BR_CLASS], text: "\n", context: null, meta: null });
}
