export const sessionId = crypto.randomUUID();
let seq = 0;

export function nextSeq(): number {
    const s = seq;
    seq++;
    return s;
}
