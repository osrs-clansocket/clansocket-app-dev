import fastGlob from "fast-glob";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function loadRoutesFrom(metaUrl: string): Promise<void> {
    const here = path.dirname(fileURLToPath(metaUrl));
    const ext = metaUrl.endsWith(".ts") ? "ts" : "js";
    const files = fastGlob
        .sync([`**/*.${ext}`, `!**/_*.${ext}`, "!**/*.d.ts"], { cwd: here })
        .filter((f) => f !== `index.${ext}`);
    for (const rel of files) {
        await import(pathToFileURL(path.join(here, rel)).href);
    }
}
