import { promptLoader, type DynamicContext, type PromptFile } from "../../prompt-loader/index.js";
import { mergeUniqueFiles } from "./merge-unique.js";

export function useContinuousProtocol(files: PromptFile[], loadedIds: Set<string>, ctx: DynamicContext): void {
    const continuousFiles = promptLoader.resolveByIds(["chain-protocol-continuous"], ctx);
    const filtered = files.filter((f) => f.id !== "chain-protocol");
    loadedIds.delete("chain-protocol");
    mergeUniqueFiles(filtered, continuousFiles, loadedIds);
    files.length = 0;
    files.push(...filtered);
}
