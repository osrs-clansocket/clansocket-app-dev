import { isAllDigits } from "./render-markdown-charclass.js";
import {
    EMOJI_ANIMATED,
    EMOJI_CLOSE,
    EMOJI_OPEN,
    EMOJI_SEP,
    LINK_CLOSE,
    LINK_MID,
    LINK_OPEN,
    type Node,
} from "./render-markdown-types.js";

export function findDelimEnd(src: string, from: number, delim: string): number {
    let i = from;
    while (i < src.length) {
        if (src.startsWith(delim, i)) return i;
        i++;
    }
    return -1;
}

export function tryParseLink(src: string, i: number): { node: Node; nextIdx: number } | null {
    if (src[i] !== LINK_OPEN) return null;
    const midIdx = src.indexOf(LINK_MID, i + 1);
    if (midIdx === -1) return null;
    const closeIdx = src.indexOf(LINK_CLOSE, midIdx + LINK_MID.length);
    if (closeIdx === -1) return null;
    const text = src.slice(i + 1, midIdx);
    const url = src.slice(midIdx + LINK_MID.length, closeIdx);
    return { node: { kind: "link", text, url }, nextIdx: closeIdx + 1 };
}

function parseEmojiName(src: string, i: number): { name: string; animated: boolean; nameEnd: number } | null {
    if (src[i] !== EMOJI_OPEN) return null;
    let cursor = i + 1;
    const animated = src[cursor] === EMOJI_ANIMATED && src[cursor + 1] === EMOJI_SEP;
    if (animated) cursor++;
    if (src[cursor] !== EMOJI_SEP) return null;
    cursor++;
    const nameEnd = src.indexOf(EMOJI_SEP, cursor);
    if (nameEnd === -1) return null;
    const name = src.slice(cursor, nameEnd);
    if (name.length === 0) return null;
    return { name, animated, nameEnd };
}

function parseEmojiId(src: string, nameEnd: number): { id: string; idEnd: number } | null {
    const idStart = nameEnd + 1;
    const idEnd = src.indexOf(EMOJI_CLOSE, idStart);
    if (idEnd === -1) return null;
    const id = src.slice(idStart, idEnd);
    if (id.length === 0 || !isAllDigits(id)) return null;
    return { id, idEnd };
}

export function tryParseEmoji(src: string, i: number): { node: Node; nextIdx: number } | null {
    const head = parseEmojiName(src, i);
    if (head === null) return null;
    const tail = parseEmojiId(src, head.nameEnd);
    if (tail === null) return null;
    const cdnUrl = `https://cdn.discordapp.com/emojis/${tail.id}.${head.animated ? "gif" : "webp"}`;
    return {
        node: { kind: "emoji", id: tail.id, name: head.name, animated: head.animated, url: cdnUrl },
        nextIdx: tail.idEnd + 1,
    };
}

export function tryParseDelim(
    src: string,
    i: number,
    delim: string,
    kind: "bold" | "italic" | "code",
): { node: Node; nextIdx: number } | null {
    if (!src.startsWith(delim, i)) return null;
    const endIdx = findDelimEnd(src, i + delim.length, delim);
    if (endIdx === -1) return null;
    return { node: { kind, text: src.slice(i + delim.length, endIdx) }, nextIdx: endIdx + delim.length };
}
