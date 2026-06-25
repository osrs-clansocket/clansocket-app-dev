import type { Node } from "../render-markdown/render-markdown-types.js";

export interface TokenBuf {
    out: Node[];
    textBuf: { v: string };
}

export function flushTokenText(buf: TokenBuf): void {
    if (buf.textBuf.v.length > 0) {
        buf.out.push({ kind: "text", text: buf.textBuf.v });
        buf.textBuf.v = "";
    }
}
