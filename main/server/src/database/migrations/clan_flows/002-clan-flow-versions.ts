import type Database from "better-sqlite3";
import { guarded, tableExists } from "../../core/migrator/migration-guards.js";

export const id = "002-clan-flow-versions";

const CREATE_SQL = `
CREATE TABLE clan_flow_versions (
    flow_id TEXT NOT NULL,
    flow_name TEXT NOT NULL,
    version INTEGER NOT NULL,
    definition_json TEXT NOT NULL,
    shape_acknowledgements_json TEXT,
    published_at INTEGER NOT NULL,
    published_by_account_hash TEXT,
    published_by_rsn TEXT,
    PRIMARY KEY (flow_id, version)
);
CREATE INDEX idx_clan_flow_versions_flow ON clan_flow_versions (flow_id, version DESC);
`;

export function ensure(db: Database.Database): void {
    guarded(db, () => !tableExists(db, "clan_flow_versions"), CREATE_SQL);
}
