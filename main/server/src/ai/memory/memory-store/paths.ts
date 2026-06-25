import { EXT_JSON } from "../../../shared/http/http-mime.js";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

export { idExistsPrompts } from "./id-exists-prompts.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const MEMORY_DIR = resolve(__dirname, "..", "memory");

export function ensureDir(): void {
    if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true });
}

export function filePath(id: string): string {
    return join(MEMORY_DIR, `${id}.json`);
}

export function currentCount(): number {
    ensureDir();
    return readdirSync(MEMORY_DIR).filter((f) => f.endsWith(EXT_JSON)).length;
}
