import { DB_NAMES } from "../../core/db-constants.js";
import { selectColumn } from "../../core/operations/index.js";

const SELECT_SQL = `SELECT application_id FROM discord_bot_identities WHERE bot_id = ?`;

export function botApplicationId(botId: string): string | null {
    return selectColumn<string>(DB_NAMES.DISCORD_BOT, SELECT_SQL, botId);
}
