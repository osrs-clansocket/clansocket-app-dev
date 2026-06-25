import { DIFF_ADD, DIFF_CONTEXT, DIFF_REMOVE, type DiffLine } from "./diff-kind.js";

function buildLcsTable(a: string[], b: string[]): number[][] {
    const m = a.length;
    const n = b.length;
    const lcs: number[][] = Array.from({ length: m + 1 }, () => Array.from<number>({ length: n + 1 }).fill(0));
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            const matched = a[i] === b[j];
            lcs[i]![j] = matched ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
        }
    }
    return lcs;
}

interface LcsCursor {
    out: DiffLine[];
    a: string[];
    b: string[];
    lcs: number[][];
    i: number;
    j: number;
}

function lcsStep(c: LcsCursor): void {
    const matched = c.lcs[c.i]![c.j]! === c.lcs[c.i + 1]![c.j + 1]! + 1;
    if (matched) {
        c.out.push({ kind: DIFF_CONTEXT, text: c.a[c.i]! });
        c.i++;
        c.j++;
        return;
    }
    if (c.lcs[c.i + 1]![c.j]! >= c.lcs[c.i]![c.j + 1]!) {
        c.out.push({ kind: DIFF_REMOVE, text: c.a[c.i]! });
        c.i++;
        return;
    }
    c.out.push({ kind: DIFF_ADD, text: c.b[c.j]! });
    c.j++;
}

function lcsWalk(a: string[], b: string[], lcs: number[][]): DiffLine[] {
    const out: DiffLine[] = [];
    const c: LcsCursor = { out, a, b, lcs, i: 0, j: 0 };
    while (c.i < a.length && c.j < b.length) lcsStep(c);
    for (let k = c.i; k < a.length; k++) out.push({ kind: DIFF_REMOVE, text: a[k]! });
    for (let k = c.j; k < b.length; k++) out.push({ kind: DIFF_ADD, text: b[k]! });
    return out;
}

export function lineDiff(before: string, after: string): DiffLine[] {
    const a = before.split("\n");
    const b = after.split("\n");
    return lcsWalk(a, b, buildLcsTable(a, b));
}
