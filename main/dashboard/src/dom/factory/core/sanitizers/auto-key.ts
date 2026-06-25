import { memoize } from "../../../../state/caches/memoize.js";
import {
    CHARCODE_DIGIT_0,
    CHARCODE_DIGIT_9,
    CHARCODE_LOWER_A,
    CHARCODE_LOWER_Z,
} from "../../../../shared/constants/ascii-constants.js";
import type { BuildSpec } from "../types.js";

const SEMANTIC_KEY_TAGS = new Set([
    "button",
    "input",
    "textarea",
    "select",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "label",
    "a",
    "form",
    "nav",
    "header",
    "footer",
    "section",
    "article",
    "aside",
    "main",
    "details",
    "summary",
]);
const KEY_HINT_MAX = 48;

const sanitizeKey = memoize(
    (text: string): string => {
        const parts: string[] = [];
        let pendingDash = false;
        let written = 0;
        const lower = text.toLowerCase();
        for (let i = 0; i < lower.length && written < KEY_HINT_MAX; i++) {
            const code = lower.charCodeAt(i);
            const isAlnum =
                (code >= CHARCODE_LOWER_A && code <= CHARCODE_LOWER_Z) ||
                (code >= CHARCODE_DIGIT_0 && code <= CHARCODE_DIGIT_9);
            if (isAlnum) {
                if (pendingDash && written > 0) {
                    parts.push("-");
                    written++;
                }
                parts.push(lower[i]!);
                written++;
                pendingDash = false;
            } else {
                pendingDash = true;
            }
        }
        return parts.join("");
    },
    { tag: "render", maxEntries: 256, keyOf: (text) => text },
);

function keyHint(spec: BuildSpec): string | null {
    const aria = spec.attrs?.["aria-label"];
    if (typeof aria === "string" && aria.length > 0) return aria;
    const name = spec.attrs?.["name"];
    if (typeof name === "string" && name.length > 0) return name;
    const placeholder = spec.attrs?.["placeholder"];
    if (typeof placeholder === "string" && placeholder.length > 0) return placeholder;
    if (typeof spec.text === "string" && spec.text.length > 0) return spec.text;
    return null;
}

export function autoKeyFor(spec: BuildSpec): string | null {
    const isKeyable = SEMANTIC_KEY_TAGS.has(spec.tag) || spec.onClick !== undefined || spec.onSubmit !== undefined;
    if (!isKeyable) return null;
    const hint = keyHint(spec);
    const slug = hint ? sanitizeKey(hint) : "";
    return slug.length > 0 ? `${spec.tag}-${slug}` : spec.tag;
}
