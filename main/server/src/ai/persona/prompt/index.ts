import { CHAIN_MODE_REACTIVE } from "../../chain/chain-modes.js";
import { promptLoader, type DynamicContext } from "../prompt-loader/index.js";
import { resolveHistoryWindow } from "../../prompts/sources/limits.js";
import type { AssembledPrompt, ChainMode, ProfileContext } from "./types.js";
import { resolvePromptFiles } from "./prompt-assembly.js";
import { buildPlaceholderData, fillPromptSections } from "./prompt-placeholders.js";
import { appendDynamicSections } from "./prompt-dynamic-sections.js";

export type { AssembledPrompt, ChainMode, ProfileContext, SessionEntry } from "./types.js";
export { formatStateFull } from "./format-state.js";

export interface BuildSystemPrompt {
    instruction: string;
    mode: string;
    pageState: Record<string, unknown> | null;
    extraContextIds: string[];
    siteAccountId: string;
    priorRawResponse: string | null;
    priorUserMessage: string | null;
    chainMode?: ChainMode;
    history?: { role: "user" | "assistant"; content: string; timestamp?: number }[];
    profile?: ProfileContext | null;
    personaOverrides?: Record<string, string>;
    modeOverrides?: Record<string, boolean>;
}

function loadFiles(args: BuildSystemPrompt, ctx: DynamicContext, modeOverrides: Record<string, boolean>) {
    return resolvePromptFiles({
        instruction: args.instruction,
        mode: args.mode,
        extraContextIds: args.extraContextIds,
        chainMode: args.chainMode ?? CHAIN_MODE_REACTIVE,
        modeOverrides,
        ctx,
    });
}

function assembleSections(
    args: BuildSystemPrompt,
    historyWindow: number,
    ctx: DynamicContext,
): { sections: string[]; loadedIds: Set<string> } {
    const personaOverrides = args.personaOverrides ?? {};
    const modeOverrides = args.modeOverrides ?? {};
    const { files, loadedIds } = loadFiles(args, ctx, modeOverrides);
    const placeholderData = buildPlaceholderData(args.pageState, personaOverrides, modeOverrides);
    const sections = fillPromptSections(files, placeholderData);
    appendDynamicSections(sections, {
        historyWindow,
        siteAccountId: args.siteAccountId,
        profile: args.profile ?? null,
        priorRawResponse: args.priorRawResponse,
        priorUserMessage: args.priorUserMessage,
    });
    return { sections, loadedIds };
}

export async function buildSystemPrompt(args: BuildSystemPrompt): Promise<AssembledPrompt> {
    await promptLoader.init();
    const historyWindow = resolveHistoryWindow(args.personaOverrides ?? {});
    const ctx: DynamicContext = {
        siteAccountId: args.siteAccountId,
        pageState: args.pageState,
        history: args.history,
        historyWindow,
    };
    const { sections, loadedIds } = assembleSections(args, historyWindow, ctx);
    return { system: sections.join("\n\n"), loadedIds: Array.from(loadedIds) };
}
