import { STATUS_PENDING } from "../../../shared/constants/outbound-status.js";
import { randomUUID } from "node:crypto";
import { discordGuildDb } from "../discord.js";

const COUNT_CHANGES_SQL = `SELECT COUNT(*) AS cnt
    FROM discord_draft_changes WHERE session_id = ?`;
const SELECT_CHANGE_SQL = `SELECT change_id FROM discord_draft_changes WHERE session_id = ?`;
const INSERT_QUEUE_SQL = `INSERT INTO discord_draft_publish_queue (
    queue_id, guild_id, session_id, op_id, status, attempt_no, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

const INITIAL_ATTEMPT = 0;
const SINGLE_CHANGE = 1;

export interface PublishSingleInput {
    clanId: string;
    guildId: string;
    sessionId: string;
}

export class MultiOpError extends Error {
    public readonly count: number;
    constructor(count: number) {
        super(`Draft session has ${count} changes; publishSingleOp requires exactly ${SINGLE_CHANGE}`);
        this.name = "MultiOpError";
        this.count = count;
    }
}

export function publishSingleOp(input: PublishSingleInput): string {
    const db = discordGuildDb(input.clanId, input.guildId);
    const queueId = randomUUID();
    const now = Date.now();
    const tx = db.transaction(() => {
        const count = (db.prepare(COUNT_CHANGES_SQL).get(input.sessionId) as { cnt: number }).cnt;
        if (count !== SINGLE_CHANGE) throw new MultiOpError(count);
        const change = db.prepare(SELECT_CHANGE_SQL).get(input.sessionId) as { change_id: string };
        db.prepare(INSERT_QUEUE_SQL).run(
            queueId,
            input.guildId,
            input.sessionId,
            change.change_id,
            STATUS_PENDING,
            INITIAL_ATTEMPT,
            now,
            now,
        );
    });
    tx();
    return queueId;
}
