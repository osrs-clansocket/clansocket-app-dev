import { NEWLINE } from "../render-markdown/render-markdown-types.js";
import { flushTokenText, type TokenBuf } from "./tokenize-buf.js";
import { consumeEmojiToken, consumeLinkDelim, consumeShortcodeToken } from "./tokenize-consumers.js";

export function consumeRichToken(src: string, i: number, buf: TokenBuf): number | null {
    if (src[i] === NEWLINE) {
        flushTokenText(buf);
        buf.out.push({ kind: "br" });
        return i + 1;
    }
    return consumeEmojiToken(src, i, buf) ?? consumeShortcodeToken(src, i, buf) ?? consumeLinkDelim(src, i, buf);
}
