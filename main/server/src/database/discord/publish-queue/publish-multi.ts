import logger from "@clansocket/logger";
import { STATUS_PENDING } from "../../../shared/constants/outbound-status.js";
import { randomUUID } from "node:crypto";
import { discordGuildDb } from "../discord.js";
import { sortChangesDeps, type DependencyEdge } from "./sort-changes.js";

const SELECT_CHANGES_SQL = `SELECT change_id FROM discord_draft_changes
    WHERE session_id = ? ORDER BY sequence_no ASC`;
const SELECT_DEPS_SQL = `SELECT change_id, dependency_change_id
    FROM discord_draft_change_deps
    WHERE dependency_change_id IS NOT NULL
      AND change_id IN (SELECT change_id FROM discord_draft_changes WHERE session_id = ?)`;
const INSERT_QUEUE_SQL = `INSERT INTO discord_draft_publish_queue (
    queue_id, guild_id, session_id, op_id, status, attempt_no, created_at, updated_at
) VALUES ($queueId, $guildId, $sessionId, $opId, $status, $attemptNo, $now, $now)`;

const INITIAL_ATTEMPT = 0;

export interface MultiDraftInput {
    clanId: string;
    guildId: string;
    sessionId: string;
}

function loadSortedChanges(db: ReturnType<typeof discordGuildDb>, sessionId: string): string[] {
    const changes = db.prepare(SELECT_CHANGES_SQL).all(sessionId) as { change_id: string }[];
    const deps = db.prepare(SELECT_DEPS_SQL).all(sessionId) as DependencyEdge[];
    return sortChangesDeps(
        changes.map((c) => c.change_id),
        deps,
    );
}

export function publishMulti(input: MultiDraftInput): string[] {
    const db = discordGuildDb(input.clanId, input.guildId);
    const sortedIds = loadSortedChanges(db, input.sessionId);
    const now = Date.now();
    const queueIds: string[] = [];
    const insert = db.prepare(INSERT_QUEUE_SQL);
    db.transaction(() => {
        logger.debug(`[publish-multi] sessionId=${input.sessionId} changes=${sortedIds.length}`);
        for (const changeId of sortedIds) {
            const queueId = randomUUID();
            insert.run({
                queueId,
                now,
                opId: changeId,
                guildId: input.guildId,
                sessionId: input.sessionId,
                status: STATUS_PENDING,
                attemptNo: INITIAL_ATTEMPT,
            });
            queueIds.push(queueId);
        }
    })();
    return queueIds;
}
