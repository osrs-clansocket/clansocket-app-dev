import type { DomElement } from "../assembly/types.js";

function buildElementExtras(el: DomElement): string {
    const extras: string[] = [];
    if (el.value) extras.push(`value="${el.value}"`);
    if (el.placeholder) extras.push(`placeholder="${el.placeholder}"`);
    if (el.checked) extras.push("checked");
    if (el.disabled) extras.push("disabled");
    if (el.href) extras.push(`href=${el.href}`);
    return extras.length > 0 ? ` ${extras.join(" ")}` : "";
}

export function formatElementLine(key: string, el: DomElement): string {
    const vis = el.visible ? "visible" : "hidden";
    const suffix = buildElementExtras(el);
    const ctx = el.context ? ` — ${el.context}` : "";
    return `  [${key}] <${el.tag}> (${vis})${suffix}${ctx}`;
}
