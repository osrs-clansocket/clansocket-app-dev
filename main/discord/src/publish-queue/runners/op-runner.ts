import type { Client, Guild } from "discord.js";
import type { PendingPublishRow } from "../../loaders/publish-queue-loader.js";
import { requireAfterJson } from "./require-after-json.js";

export async function runPublishOp<T>(
    client: Client,
    row: PendingPublishRow,
    op: string,
    apply: (guild: Guild, data: T) => Promise<string | null | void>,
): Promise<{ snowflakeResolved: string | null }> {
    const data = requireAfterJson<T>(row, op);
    const guild = await client.guilds.fetch(row.guild_id);
    const result = await apply(guild, data);
    return { snowflakeResolved: typeof result === "string" ? result : null };
}
