import { chainModeStore, type ChainMode } from "../chain-mode-store";
import { SLASH_CONT_LONG, SLASH_CONT_SHORT, SLASH_CONT_SHORT_SPACE, type SendElements } from "./types.js";

const SLASH_PREFIXES: readonly string[] = [SLASH_CONT_LONG, SLASH_CONT_SHORT_SPACE];

function extractSlashCommand(lower: string): string | null {
    for (const prefix of SLASH_PREFIXES) {
        if (lower.startsWith(prefix)) return lower.slice(prefix.length).trim();
    }
    if (lower === SLASH_CONT_SHORT) return "";
    return null;
}

const CHAIN_MODE_BY_ARG: Record<string, ChainMode> = { on: "continuous", off: "reactive" };

function resolveChainMode(arg: string): ChainMode {
    return CHAIN_MODE_BY_ARG[arg] ?? (chainModeStore.get() === "reactive" ? "continuous" : "reactive");
}

export function handleSlashCommand(raw: string, els: SendElements): boolean {
    const arg = extractSlashCommand(raw.toLowerCase().trim());
    if (arg === null) return false;
    const next = resolveChainMode(arg);
    chainModeStore.set(next);
    els.addMsg({ containerEl: els.messagesEl, text: `chain mode → ${next}`, type: "status" });
    return true;
}
