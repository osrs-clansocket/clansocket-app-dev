import { defineTopic, type ProjectionTopic } from "../projection.js";
import { guildScopeKey } from "../writes-stream.js";

export interface GuildTopicOpts<T> {
    clanId: string;
    guildId: string;
    tables: readonly string[];
    loader: (clanId: string, guildId: string) => T[];
    keyOf: (row: Record<string, unknown>) => string;
}

export function guildTopic<T>(opts: GuildTopicOpts<T>): ProjectionTopic {
    const scopeKey = guildScopeKey(opts.clanId, opts.guildId);
    return defineTopic({
        triggers: opts.tables.map((table) => ({ scopeKey, table })),
        query: () => opts.loader(opts.clanId, opts.guildId) as unknown as Record<string, unknown>[],
        keyOf: opts.keyOf,
    });
}

export function singleKeyOf(keyField: string): (row: Record<string, unknown>) => string {
    return (row) => String(row[keyField]);
}
