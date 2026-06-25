import type { Instance } from "../../../../../../../../factory";
import { tokenize } from "../../../../../../../../../state/discord/auto-hooks/preview/render-markdown/render-markdown-tokenize.js";
import { nodeToInstance } from "../markdown-node-instance.js";

export function renderMarkdownNodes(src: string): Instance[] {
    return tokenize(src).map(nodeToInstance);
}
