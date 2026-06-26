import { readFileSync } from "fs";
import { parseFrontmatterValue } from "./frontmatter-parser.js";

const FRONTMATTER_DELIM = "---";

export function readMd<T>(filePath: string): T {
    const lines = readFileSync(filePath, "utf-8")
        .split("\n")
        .map((line) => (line.endsWith("\r") ? line.slice(0, -1) : line));
    if (lines[0] !== FRONTMATTER_DELIM) throw new Error(`Missing frontmatter in ${filePath}`);
    const endIdx = lines.findIndex((l, i) => i > 0 && l === FRONTMATTER_DELIM);
    if (endIdx === -1) throw new Error(`Missing frontmatter in ${filePath}`);
    const meta: Record<string, unknown> = {};
    for (const line of lines.slice(1, endIdx)) {
        const idx = line.indexOf(":");
        const trimmed = line.trim();
        if (trimmed.length === 0 || trimmed.startsWith("#") || idx < 0) continue;
        meta[line.slice(0, idx).trim()] = parseFrontmatterValue(line.slice(idx + 1));
    }
    meta.content = lines
        .slice(endIdx + 1)
        .join("\n")
        .trimStart();
    return meta as T;
}
