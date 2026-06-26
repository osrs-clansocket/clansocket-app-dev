import { image, span, type Instance, textProps } from "../../../../../../../factory";
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
    if (n.kind === "text") return span(textProps([MD_TEXT_CLASS], n.text));
    if (n.kind === "bold") return span(textProps([MD_BOLD_CLASS], n.text));
    if (n.kind === "italic") return span(textProps([MD_ITALIC_CLASS], n.text));
    if (n.kind === "code") return span(textProps([MD_CODE_CLASS], n.text));
    if (n.kind === "link") {
        const s = span(textProps([MD_LINK_CLASS], n.text));
        s.setAttr("title", n.url);
        return s;
    }
    if (n.kind === "emoji") return buildEmojiNode(n);
    return span(textProps([MD_BR_CLASS], "\n"));
}
