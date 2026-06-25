import { tryParseLink } from "./render-markdown/render-markdown-tokens.js";
import { flushTokenText, type TokenBuf } from "./tokenize/tokenize-buf.js";
import { parseAllDelims } from "./tokenize/tokenize-delim.js";

export function consumeLinkDelim(src: string, i: number, buf: TokenBuf): number | null {
    const link = tryParseLink(src, i);
    if (link !== null) {
        flushTokenText(buf);
        buf.out.push(link.node);
        return link.nextIdx;
    }
    const delim = parseAllDelims(src, i);
    if (delim !== null) {
        flushTokenText(buf);
        buf.out.push(delim.node);
        return delim.nextIdx;
    }
    return null;
}
