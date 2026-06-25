import { tryParseEmoji } from "./render-markdown/render-markdown-tokens.js";
import { flushTokenText, type TokenBuf } from "./tokenize/tokenize-buf.js";

export function consumeEmojiToken(src: string, i: number, buf: TokenBuf): number | null {
    const emoji = tryParseEmoji(src, i);
    if (emoji === null) return null;
    flushTokenText(buf);
    buf.out.push(emoji.node);
    return emoji.nextIdx;
}
