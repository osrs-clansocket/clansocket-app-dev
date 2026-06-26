import { resolve } from "path";
import { STATIC_DB_NAMES } from "./db-constants.js";
import { DATA_DIR } from "./db-paths-base.js";

const STATIC_DB_SUBDIRS: Record<string, string> = {
    [STATIC_DB_NAMES.WORLD_MAP]: "map",
};

export function staticDbPath(name: string): string {
    const subdir = STATIC_DB_SUBDIRS[name];
    if (subdir) return resolve(DATA_DIR, subdir, `${name}.db`);
    return resolve(DATA_DIR, `${name}.db`);
}

export function staticDbKey(name: string): string {
    return `static:${name}`;
}
