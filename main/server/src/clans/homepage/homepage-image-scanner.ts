import { readdir } from "node:fs/promises";
import { homepageDir, splitExt } from "./homepage-image-paths.js";

export async function listEntries(clanId: string): Promise<string[]> {
    try {
        return await readdir(homepageDir(clanId));
    } catch {
        return [];
    }
}

export async function entriesMatching(clanId: string, key: string): Promise<string[]> {
    const all = await listEntries(clanId);
    return all.filter((entry) => splitExt(entry).base === key);
}
