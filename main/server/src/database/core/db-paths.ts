import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export {
    clanDirPath,
    ensureClanDir,
    clanRelPath,
    clanDbKey,
    auditDbKey,
    vaultDbKey,
    pluginDbKey,
} from "./clan-db-paths.js";
export { guildDbFile, guildDbKey } from "./guild-db-paths.js";
export { staticDbPath, staticDbKey } from "./static-db-paths.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = resolve(__dirname, "..", "..", "..", "data");

export function schemasDir(schemaKey: string): string {
    return resolve(__dirname, "..", "schemas", schemaKey);
}

export function dbPath(name: string): string {
    return resolve(DATA_DIR, `${name}.db`);
}
