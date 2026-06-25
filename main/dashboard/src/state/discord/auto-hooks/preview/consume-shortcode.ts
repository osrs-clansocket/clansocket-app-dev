import { tryParseShortcode } from "./render-markdown/render-markdown-shortcode.js";
import { flushTokenText, type TokenBuf } from "./tokenize/tokenize-buf.js";

export function consumeShortcodeToken(src: string, i: number, buf: TokenBuf): number | null {
    const shortcode = tryParseShortcode(src, i);
    if (shortcode === null) return null;
    flushTokenText(buf);
    if (shortcode.kind === "node") buf.out.push(shortcode.node);
    return shortcode.nextIdx;
}
