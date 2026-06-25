import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const SEMANTICS_PATH = join(dirname(fileURLToPath(import.meta.url)), "../../../prompts/auto-gen/db-semantics.json");

function loadDbSemantics(): Record<string, Record<string, string>> {
    try {
        return JSON.parse(readFileSync(SEMANTICS_PATH, "utf-8")) as Record<string, Record<string, string>>;
    } catch {
        return {};
    }
}

export const DB_SEMANTICS = loadDbSemantics();
