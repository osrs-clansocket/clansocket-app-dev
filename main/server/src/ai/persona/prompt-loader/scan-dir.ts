import { EXT_JSON, EXT_MD } from "../../../shared/http/http-mime.js";
import logger from "@clansocket/logger";
import { readdirSync, statSync } from "fs";
import { resolve } from "path";
import { readJson, readMd } from "./file-reader.js";
import type { PromptFile } from "./types.js";
import { setPromptFile } from "./prompt-registry-store.js";

function loadPromptAt(full: string, entry: string): void {
    try {
        const file = entry.endsWith(EXT_MD) ? readMd<PromptFile>(full) : readJson<PromptFile>(full);
        if (file.id && file.type && file.content) {
            setPromptFile(file.id, file);
        }
    } catch (err) {
        logger.warn(`[prompt-loader] skipped ${full}: ${(err as Error).message}`);
    }
}

export function scanDir(dir: string): void {
    for (const entry of readdirSync(dir)) {
        const full = resolve(dir, entry);
        if (statSync(full).isDirectory()) {
            scanDir(full);
        } else if (entry !== "registry.json" && (entry.endsWith(EXT_MD) || entry.endsWith(EXT_JSON))) {
            loadPromptAt(full, entry);
        }
    }
}
