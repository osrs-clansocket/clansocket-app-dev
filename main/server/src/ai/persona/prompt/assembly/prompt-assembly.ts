import { CHAIN_MODE_CONTINUOUS } from "../../../chain/chain-modes.js";
import { promptLoader, type DynamicContext, type PromptFile } from "../../prompt-loader/index.js";
import { dropExcluded } from "../mode-derivation/drop-excluded.js";
import { mergeUniqueFiles } from "./merge-unique.js";
import { useContinuousProtocol } from "./continuous-protocol.js";
import type { ChainMode } from "./types.js";

interface ResolveFilesArgs {
    instruction: string;
    mode: string;
    extraContextIds: string[];
    chainMode: ChainMode;
    modeOverrides: Record<string, boolean>;
    ctx: DynamicContext;
}

export function resolvePromptFiles(args: ResolveFilesArgs): { files: PromptFile[]; loadedIds: Set<string> } {
    const resolved = promptLoader.resolve(args.instruction, args.mode, args.ctx);
    const extra = promptLoader.resolveByIds(args.extraContextIds, args.ctx);
    const files = [...resolved];
    const loadedIds = new Set(resolved.map((f) => f.id));
    mergeUniqueFiles(files, extra, loadedIds);
    if (args.chainMode === CHAIN_MODE_CONTINUOUS) useContinuousProtocol(files, loadedIds, args.ctx);
    dropExcluded(files, loadedIds, args.modeOverrides);
    files.sort((a, b) => a.priority - b.priority);
    return { files, loadedIds };
}
