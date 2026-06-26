import { prismOrNull } from "./prism-setup";
import { tagBraces } from "./markdown-braces.js";

export function highlightCode(code: string, lang: string): string {
    const Prism = prismOrNull();
    if (!Prism) return code;
    const grammar = Prism.languages[lang];
    return grammar ? tagBraces(Prism.highlight(code, grammar, lang)) : code;
}
