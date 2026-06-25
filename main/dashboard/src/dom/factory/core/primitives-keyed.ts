import { build } from "./build.js";
import type { Child, Instance } from "./types.js";

const TAG_DIV = "div";

export function buildKeyedDiv(cls: string, key: string, children: readonly Child[] = []): Instance {
    return build({ tag: TAG_DIV, classes: [cls], key, children });
}

export function keyedAttrsDiv(
    cls: string,
    key: string,
    attrs: Record<string, string>,
    children: readonly Child[] = [],
): Instance {
    return build({ tag: TAG_DIV, classes: [cls], key, attrs, children });
}
