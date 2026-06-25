import { BOLD_DELIM, CODE_DELIM, ITALIC_DELIM, type Node } from "../render-markdown/render-markdown-types.js";
import { tryParseDelim } from "../render-markdown/render-markdown-tokens.js";

export function parseAllDelims(src: string, i: number): { node: Node; nextIdx: number } | null {
    return (
        tryParseDelim(src, i, BOLD_DELIM, "bold") ??
        tryParseDelim(src, i, ITALIC_DELIM, "italic") ??
        tryParseDelim(src, i, CODE_DELIM, "code")
    );
}
