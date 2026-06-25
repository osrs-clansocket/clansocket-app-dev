import type { Guild } from "discord.js";

type SubjectApplier = (guild: Guild, id: string, data: any) => Promise<unknown>;

export function dispatcherBySubject<T>(
    appliers: Record<string, SubjectApplier>,
    fallback: (guild: Guild, id: string, data: T) => Promise<void>,
): (guild: Guild, id: string, data: Record<string, unknown>) => Promise<void> {
    return async (guild, id, data) => {
        const applier = appliers[data.subject as string];
        if (applier) await applier(guild, id, data);
        else await fallback(guild, id, data as T);
    };
}
