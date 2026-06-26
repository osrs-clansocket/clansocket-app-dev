import { marked, type Tokens } from "marked";
import { markedHighlight } from "marked-highlight";
import { prismOrNull } from "./prism-setup";
import { isDataKey, missingRef, tryClone, visitPagePlaceholder } from "../dom/factory/data-ops";
import { tagBraces } from "./markdown-braces.js";

const NO_DEEP_LINK = null;
let currentDeepLink: string | null = NO_DEEP_LINK;

const AI_CLONE_DELIM = "Δ";
const AI_CLONE_TOKEN = "aiClone";

interface AiCloneToken extends Tokens.Generic {
    type: typeof AI_CLONE_TOKEN;
    raw: string;
    key: string;
}

marked.use(
    markedHighlight({
        langPrefix: "language-",
        highlight(code, lang) {
            const Prism = prismOrNull();
            if (!Prism) return code;
            const language = lang && Prism.languages[lang] ? lang : "plain";
            const grammar = Prism.languages[language];
            return grammar ? tagBraces(Prism.highlight(code, grammar, language)) : code;
        },
    }),
);

marked.use({
    extensions: [
        {
            name: AI_CLONE_TOKEN,
            level: "inline",
            start(src: string): number | undefined {
                const idx = src.indexOf(AI_CLONE_DELIM);
                return idx === -1 ? undefined : idx;
            },
            tokenizer(src: string): AiCloneToken | undefined {
                if (!src.startsWith(AI_CLONE_DELIM)) return undefined;
                const close = src.indexOf(AI_CLONE_DELIM, AI_CLONE_DELIM.length);
                if (close === -1) return undefined;
                const key = src.slice(AI_CLONE_DELIM.length, close);
                if (!isDataKey(key)) return undefined;
                return {
                    type: AI_CLONE_TOKEN,
                    raw: src.slice(0, close + AI_CLONE_DELIM.length),
                    key,
                };
            },
            renderer(token: Tokens.Generic): string {
                const key = (token as AiCloneToken).key;
                const clone = tryClone(key);
                if (clone !== NO_DEEP_LINK) return clone;
                if (currentDeepLink !== NO_DEEP_LINK && currentDeepLink !== window.location.pathname) {
                    return visitPagePlaceholder(currentDeepLink, key);
                }
                return missingRef(key);
            },
        },
    ],
});

function renderMarkdown(text: string, deepLink: string | null = NO_DEEP_LINK): string {
    currentDeepLink = deepLink;
    try {
        return marked.parse(text, { async: false }) as string;
    } finally {
        currentDeepLink = NO_DEEP_LINK;
    }
}

export { renderMarkdown };
export { highlightCode } from "./markdown-highlight.js";
export { stripCodeFences } from "./markdown-fences.js";
