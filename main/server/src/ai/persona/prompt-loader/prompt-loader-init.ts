import logger from "@clansocket/logger";
import { existsSync } from "fs";
import { join } from "path";
import { MEMORY_DIR, readJson } from "./file-reader.js";
import type { PromptFile } from "./types.js";
import { deletePromptFile, setPromptFile } from "./prompt-registry-store.js";
import { reloadPrompts } from "./reload-prompts.js";

let scanned = false;

export function ensureInit(): void {
    if (scanned) return;
    reloadPrompts();
    scanned = true;
}

export function reloadFile(id: string): void {
    if (!existsSync(MEMORY_DIR)) {
        deletePromptFile(id);
        return;
    }
    const p = join(MEMORY_DIR, `${id}.json`);
    if (!existsSync(p)) {
        deletePromptFile(id);
        return;
    }
    try {
        const file = readJson<PromptFile>(p);
        if (file.id && file.type && file.content) setPromptFile(file.id, file);
    } catch (err) {
        logger.warn(`[prompt-loader] reload skipped ${p}: ${(err as Error).message}`);
    }
}
