import logger from "@clansocket/logger";
import { DB_NAMES } from "../../core/db-constants.js";
import { getDb } from "../../core/database.js";

const DEFAULT_BOT_ID = "clansocket-default";
const DEFAULT_TEMPLATE_ID = "clansocket-default-presence";
const DEFAULT_TEMPLATE_NAME = "ClanSocket Default";
const DEFAULT_STATUS = "online";
const DEFAULT_ACTIVITY_TYPE = 0;
const DEFAULT_ACTIVITY_NAME = "ClanSocket";
const DEFAULT_CREATED_BY = "system";
const DEFAULT_VARIABLE_SCHEMA = "[]";

const TEMPLATE_INSERT_SQL = `INSERT INTO discord_bot_presence_templates (
    template_id, bot_id, name, status, activity_type, activity_name_template,
    variable_schema_json, refresh_schedule_json, last_rendered_at, last_pushed_at,
    created_by_site_account_id, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const ACTIVATE_TEMPLATE_SQL = `UPDATE discord_bot_identities
    SET active_presence_template_id = ?, updated_at = ?
    WHERE bot_id = ? AND active_presence_template_id IS NULL`;

function shouldSeed(db: ReturnType<typeof getDb>): boolean {
    const templateExists = db
        .prepare(`SELECT 1 FROM discord_bot_presence_templates WHERE template_id = ?`)
        .get(DEFAULT_TEMPLATE_ID);
    if (templateExists) return false;
    const identityExists = db.prepare(`SELECT 1 FROM discord_bot_identities WHERE bot_id = ?`).get(DEFAULT_BOT_ID);
    return Boolean(identityExists);
}

export function seedPresenceTemplate(): boolean {
    const db = getDb(DB_NAMES.DISCORD_BOT);
    if (!shouldSeed(db)) return false;
    const now = Date.now();
    db.prepare(TEMPLATE_INSERT_SQL).run(
        DEFAULT_TEMPLATE_ID,
        DEFAULT_BOT_ID,
        DEFAULT_TEMPLATE_NAME,
        DEFAULT_STATUS,
        DEFAULT_ACTIVITY_TYPE,
        DEFAULT_ACTIVITY_NAME,
        DEFAULT_VARIABLE_SCHEMA,
        null,
        null,
        null,
        DEFAULT_CREATED_BY,
        now,
        now,
    );
    db.prepare(ACTIVATE_TEMPLATE_SQL).run(DEFAULT_TEMPLATE_ID, now, DEFAULT_BOT_ID);
    logger.info(`[discord] seeded default presence template for ${DEFAULT_BOT_ID}`);
    return true;
}
