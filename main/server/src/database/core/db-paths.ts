import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export {
    clanDirPath,
    ensureClanDir,
    clanRelPath,
    clanDbKey,
    auditDbKey,
    vaultDbKey,
    uiDbKey,
    pluginDbKey,
    flowsDbKey,
} from "./clan-db-paths.js";
export { guildDbFile, guildDbKey } from "./guild-db-paths.js";
export { staticDbPath, staticDbKey } from "./static-db-paths.js";
export { DATA_DIR } from "./db-paths-base.js";
import { DATA_DIR } from "./db-paths-base.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function schemasDir(schemaKey: string): string {
    return resolve(__dirname, "..", "schemas", schemaKey);
}

export function dbPath(name: string): string {
    return resolve(DATA_DIR, `${name}.db`);
}
