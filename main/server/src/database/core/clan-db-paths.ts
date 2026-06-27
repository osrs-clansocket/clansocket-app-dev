import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { CLANS_SUBDIR, PLUGIN_DB_PREFIX } from "./db-constants.js";
import { DATA_DIR } from "./db-paths-base.js";

export function clanDirPath(clanId: string): string {
    return resolve(DATA_DIR, CLANS_SUBDIR, clanId);
}

export function ensureClanDir(clanId: string): string {
    const dir = clanDirPath(clanId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
}

export function clanRelPath(clanId: string): string {
    return `${CLANS_SUBDIR}/${clanId}`;
}

export function clanDbKey(clanId: string): string {
    return `clan:${clanId}:clan`;
}

export function auditDbKey(clanId: string): string {
    return `clan:${clanId}:audit`;
}

export function vaultDbKey(clanId: string): string {
    return `clan:${clanId}:vault`;
}

export function uiDbKey(clanId: string): string {
    return `clan:${clanId}:ui`;
}

export function pluginDbKey(clanId: string, mode: string): string {
    return `clan:${clanId}:${PLUGIN_DB_PREFIX}${mode}`;
}

export function flowsDbKey(clanId: string): string {
    return `clan:${clanId}:flows`;
}
