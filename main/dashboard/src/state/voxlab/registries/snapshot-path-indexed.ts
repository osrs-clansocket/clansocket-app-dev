import type { PathSpec } from "./snapshot-path-types.js";

export function indexedNumberPath(
    suffix: string,
    descend: (state: unknown) => number[] | undefined,
    index: number,
): PathSpec {
    return {
        suffix,
        type: "number",
        read: (s) => {
            const arr = descend(s);
            return arr !== undefined ? arr[index] : undefined;
        },
        write: (s, v) => {
            const arr = descend(s);
            if (arr !== undefined) {
                arr[index] = v as number;
            }
        },
    };
}
