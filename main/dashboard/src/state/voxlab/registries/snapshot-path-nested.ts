import type { PathSpec } from "./snapshot-path-types.js";

export function nestedPath(
    prefix: string,
    descend: (state: unknown) => Record<string, unknown> | undefined,
    inner: PathSpec,
): PathSpec {
    return {
        suffix: `${prefix}.${inner.suffix}`,
        type: inner.type,
        read: (s) => {
            const target = descend(s);
            return target !== undefined ? inner.read(target) : undefined;
        },
        write: (s, v) => {
            const target = descend(s);
            if (target !== undefined) {
                inner.write(target, v);
            }
        },
    };
}
