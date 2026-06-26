const ACCEPT = 1;
const REJECT = -1;
const CONTINUE = 0;

export type ScanVerdict = 1 | -1 | 0;

export const SCAN = { ACCEPT, REJECT, CONTINUE } as const;

export function scanUntil(src: string, start: number, limit: number, classify: (c: string) => ScanVerdict): number {
    for (let j = start; j < limit; j++) {
        const v = classify(src[j]);
        if (v !== CONTINUE) return v === ACCEPT ? j : -1;
    }
    return -1;
}
