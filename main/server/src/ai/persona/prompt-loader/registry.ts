import { EXT_JSON, EXT_MD } from "../../../shared/http/http-mime.js";
import logger from "@clansocket/logger";
import { watch } from "fs";
import { PROMPTS_DIR } from "./prompt-paths.js";
import { reloadPrompts } from "./reload-prompts.js";

export { setPromptFile, deletePromptFile, getPromptFile, listPromptFiles } from "./prompt-registry-store.js";
export { reloadPrompts } from "./reload-prompts.js";
export { ensureInit, reloadFile } from "./prompt-loader-init.js";

const WATCHER_DEBOUNCE_MS = 200;

let watcher: ReturnType<typeof watch> | null = null;

function stopWatcher(): void {
    watcher?.close();
    watcher = null;
}

export function startWatcher(): () => void {
    if (watcher) return stopWatcher;
    let pending: ReturnType<typeof setTimeout> | null = null;
    const schedule = (): void => {
        if (pending) clearTimeout(pending);
        pending = setTimeout(() => {
            pending = null;
            reloadPrompts();
            logger.info("[prompt-loader] rescanned prompts");
        }, WATCHER_DEBOUNCE_MS);
    };
    watcher = watch(PROMPTS_DIR, { recursive: true }, (_event, filename) => {
        if (typeof filename !== "string") return;
        if (filename.endsWith(EXT_MD) || filename.endsWith(EXT_JSON)) schedule();
    });
    return stopWatcher;
}
