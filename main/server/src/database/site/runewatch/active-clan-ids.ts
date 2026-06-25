import { DB_NAMES } from "../../core/database.js";
import { selectColumns } from "../../../shared/loaders/db-rows.js";

const SELECT_SQL = `SELECT id FROM clansocket_clans WHERE archived_at IS NULL`;

export function activeClanIds(): string[] {
    return selectColumns<string>(DB_NAMES.APP, SELECT_SQL);
}
