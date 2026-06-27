import { writeFile, unlink, stat, mkdir } from "node:fs/promises";
import { HOMEPAGE_IMAGE_MIME_EXT } from "./upload-middleware-homepage.js";
import { isValidImageKey } from "./homepage-image-key.js";
import { homepageDir, homepagePath, splitExt } from "./homepage-image-paths.js";
import { entriesMatching, listEntries } from "./homepage-image-scanner.js";

export interface PersistedImage {
    key: string;
    ext: string;
    byteSize: number;
    version: number;
}

export async function removeExistingForKey(clanId: string, key: string): Promise<void> {
    const matches = await entriesMatching(clanId, key);
    await Promise.all(matches.map((entry) => unlink(homepagePath(clanId, entry)).catch(() => undefined)));
}

export async function persistHomepageImage(
    clanId: string,
    key: string,
    mimetype: string,
    buffer: Buffer,
): Promise<PersistedImage | null> {
    const ext = HOMEPAGE_IMAGE_MIME_EXT[mimetype];
    if (!ext) return null;
    if (!isValidImageKey(key)) return null;
    await mkdir(homepageDir(clanId), { recursive: true });
    await removeExistingForKey(clanId, key);
    const target = homepagePath(clanId, `${key}${ext}`);
    await writeFile(target, buffer);
    const st = await stat(target);
    return { key, ext: ext.slice(1), byteSize: buffer.length, version: Math.floor(st.mtimeMs) };
}

export async function findImageByKey(
    clanId: string,
    key: string,
): Promise<{ path: string; ext: string; version: number } | null> {
    if (!isValidImageKey(key)) return null;
    const entries = await listEntries(clanId);
    for (const entry of entries) {
        const { base, ext } = splitExt(entry);
        if (base !== key) continue;
        const fullPath = homepagePath(clanId, entry);
        const st = await stat(fullPath).catch(() => null);
        if (!st) continue;
        return { path: fullPath, ext, version: Math.floor(st.mtimeMs) };
    }
    return null;
}
