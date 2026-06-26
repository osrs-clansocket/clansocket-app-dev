import { existsSync } from "fs";
import { MEMORY_DIR, PROMPTS_DIR } from "./prompt-paths.js";
import { scanDir } from "./scan-dir.js";

export function reloadPrompts(): void {
    scanDir(PROMPTS_DIR);
    if (existsSync(MEMORY_DIR)) scanDir(MEMORY_DIR);
}
