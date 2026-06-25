import type { Node } from "./render-markdown-types.js";
import { flushTokenText, type TokenBuf } from "../tokenize/tokenize-buf.js";
import { consumeRichToken } from "../tokenize/tokenize-rich-token.js";

export function tokenize(src: string): Node[] {
    const buf: TokenBuf = { out: [], textBuf: { v: "" } };
    let i = 0;
    while (i < src.length) {
        const next = consumeRichToken(src, i, buf);
        if (next !== null) {
            i = next;
            continue;
        }
        buf.textBuf.v += src[i];
        i++;
    }
    flushTokenText(buf);
    return buf.out;
}
