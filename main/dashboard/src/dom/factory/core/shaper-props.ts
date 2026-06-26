import type { ReactiveValue } from "../reactive/index.js";
import type { MetaTag } from "./semantics/meta-tags.js";
import type { BaseProps } from "./types.js";

export function baseProps(
    classes: readonly string[] | undefined,
    context: string | null = null,
    meta: readonly MetaTag[] | null = null,
): BaseProps {
    return { classes, context, meta };
}

export function textProps(
    classes: readonly string[] | undefined,
    text: ReactiveValue<string>,
    context: string | null = null,
    meta: readonly MetaTag[] | null = null,
): BaseProps {
    return { classes, text, context, meta };
}
