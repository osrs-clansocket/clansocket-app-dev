import { build } from "./build.js";
import type { Factory } from "./types.js";
import { resolveClasses } from "./primitives-class.js";

export { buildAttrs } from "./primitives-attrs.js";
export { joinClasses, resolveClasses } from "./primitives-class.js";
export { buildKeyedDiv, keyedAttrsDiv } from "./primitives-keyed.js";

export function primitive(tag: string, baseClass: string | null = null): Factory {
    return (props = {}, children = []) =>
        build({
            ...props,
            tag,
            classes: resolveClasses(baseClass, props.classes),
            children,
        });
}
