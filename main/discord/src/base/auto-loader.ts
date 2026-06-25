import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

interface AutoLoadOptions {
    skipPrefix?: string;
    skipNames?: ReadonlySet<string>;
}

const DEFAULT_SKIP_NAMES: ReadonlySet<string> = new Set(["index.js", "index.ts"]);
const DEFAULT_SKIP_PREFIX = "_";
const LOAD_CONCURRENCY = 16;
const SOURCE_EXT: ReadonlySet<string> = new Set([".js", ".ts"]);

async function collectFiles(dir: string, opts: AutoLoadOptions): Promise<string[]> {
    const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
    const skip = opts.skipPrefix ?? DEFAULT_SKIP_PREFIX;
    const skipNames = opts.skipNames ?? DEFAULT_SKIP_NAMES;
    return entries
        .filter(
            (e) =>
                e.isFile() &&
                SOURCE_EXT.has(path.extname(e.name)) &&
                !e.name.startsWith(skip) &&
                !skipNames.has(e.name),
        )
        .map((e) => {
            const parent =
                (e as { parentPath?: string; path?: string }).parentPath ?? (e as { path?: string }).path ?? dir;
            return path.join(parent, e.name);
        });
}

export async function autoLoadDir(dirUrl: string, opts: AutoLoadOptions = {}): Promise<number> {
    const here = path.dirname(fileURLToPath(dirUrl));
    const files = await collectFiles(here, opts);
    for (let i = 0; i < files.length; i += LOAD_CONCURRENCY) {
        await Promise.all(files.slice(i, i + LOAD_CONCURRENCY).map((f) => import(pathToFileURL(f).href)));
    }
    return files.length;
}
