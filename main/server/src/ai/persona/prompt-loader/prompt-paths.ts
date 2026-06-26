import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROMPTS_DIR = resolve(__dirname, "..", "..", "prompts");
export const MEMORY_DIR = resolve(__dirname, "..", "..", "memory", "memory");
