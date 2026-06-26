import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const INDEX_BASENAME_PREFIX = "index.";
const SKIP_BASENAME_PREFIX = "_";
const DECLARATION_SUFFIX = ".d.ts";

function isLoadable(basename: string, expectedExt: string): boolean {
    if (!basename.endsWith(expectedExt)) return false;
    if (basename.endsWith(DECLARATION_SUFFIX)) return false;
    if (basename.startsWith(SKIP_BASENAME_PREFIX)) return false;
    return true;
}

export async function loadRoutesFrom(metaUrl: string): Promise<void> {
    const here = path.dirname(fileURLToPath(metaUrl));
    const ext = metaUrl.endsWith(".ts") ? "ts" : "js";
    const expectedExt = `.${ext}`;
    const bootstrapIndexPath = path.join(here, `${INDEX_BASENAME_PREFIX}${ext}`);
    const entries = await readdir(here, { recursive: true, withFileTypes: true });
    const loadable = entries.filter((entry) => entry.isFile() && isLoadable(entry.name, expectedExt));
    for (const entry of loadable) {
        const fullPath = path.join(entry.parentPath, entry.name);
        if (fullPath === bootstrapIndexPath) continue;
        await import(pathToFileURL(fullPath).href);
    }
}
