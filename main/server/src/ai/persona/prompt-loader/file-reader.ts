import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { parseFrontmatterValue } from "./frontmatter-parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROMPTS_DIR = resolve(__dirname, "..", "..", "prompts");
export const MEMORY_DIR = resolve(__dirname, "..", "..", "memory", "memory");

const FRONTMATTER_DELIM = "---";

export function readJson<T>(filePath: string): T {
    return JSON.parse(readFileSync(filePath, "utf-8"));
}

function splitLines(text: string): string[] {
    return text.split("\n").map((line) => (line.endsWith("\r") ? line.slice(0, -1) : line));
}

function splitFrontmatter(raw: string): { metaLines: string[]; body: string } | null {
    const lines = splitLines(raw);
    if (lines[0] !== FRONTMATTER_DELIM) return null;
    let endIdx = -1;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i] === FRONTMATTER_DELIM) {
            endIdx = i;
            break;
        }
    }
    if (endIdx === -1) return null;
    return {
        metaLines: lines.slice(1, endIdx),
        body: lines.slice(endIdx + 1).join("\n"),
    };
}

function ingestMetaLine(meta: Record<string, unknown>, line: string): void {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) return;
    const idx = line.indexOf(":");
    if (idx < 0) return;
    const key = line.slice(0, idx).trim();
    meta[key] = parseFrontmatterValue(line.slice(idx + 1));
}

export function readMd<T>(filePath: string): T {
    const raw = readFileSync(filePath, "utf-8");
    const parsed = splitFrontmatter(raw);
    if (!parsed) throw new Error(`Missing frontmatter in ${filePath}`);
    const meta: Record<string, unknown> = {};
    for (const line of parsed.metaLines) {
        ingestMetaLine(meta, line);
    }
    meta.content = parsed.body.trimStart();
    return meta as T;
}
