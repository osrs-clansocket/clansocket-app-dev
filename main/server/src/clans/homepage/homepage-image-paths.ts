import { resolve } from "node:path";
import { ensureClanDir } from "../../database/core/db-paths.js";

const HOMEPAGE_SUBDIR = "homepage";

export function homepageDir(clanId: string): string {
    return resolve(ensureClanDir(clanId), HOMEPAGE_SUBDIR);
}

export function homepagePath(clanId: string, entry: string): string {
    return resolve(homepageDir(clanId), entry);
}

export function splitExt(entry: string): { base: string; ext: string } {
    const dot = entry.lastIndexOf(".");
    if (dot === -1) return { base: entry, ext: "" };
    return { base: entry.slice(0, dot), ext: entry.slice(dot + 1) };
}
