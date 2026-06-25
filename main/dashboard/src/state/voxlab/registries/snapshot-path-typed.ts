import type { PathSpec } from "./snapshot-path-types.js";

function path(suffix: string, key: string, type: PathSpec["type"]): PathSpec {
    return {
        suffix,
        type,
        read: (s) => (s as Record<string, unknown>)[key],
        write: (s, v) => {
            (s as Record<string, unknown>)[key] = v;
        },
    };
}

export function pathNumber(suffix: string, key: string): PathSpec {
    return path(suffix, key, "number");
}

export function pathColor(suffix: string, key: string): PathSpec {
    return path(suffix, key, "color");
}

export function pathStep(suffix: string, key: string): PathSpec {
    return path(suffix, key, "step");
}
