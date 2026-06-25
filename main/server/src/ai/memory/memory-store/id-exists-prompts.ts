import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { walkHasId } from "./walk-has-id.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = resolve(__dirname, "..", "..", "prompts");

export function idExistsPrompts(id: string): boolean {
    if (!existsSync(PROMPTS_DIR)) return false;
    return walkHasId(PROMPTS_DIR, id);
}
