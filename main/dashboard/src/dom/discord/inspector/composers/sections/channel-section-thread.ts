import type { Instance } from "../../../../factory";
import type { DiscordChannel } from "../../../../../state/discord/client.js";
import { buildReadonlySection } from "../../builders/section-builder.js";

const ISO_DATE_END = 16;

function formatTimestamp(ms: number | null): string {
    if (ms === null) return "—";
    return new Date(ms).toISOString().slice(0, ISO_DATE_END).replace("T", " ");
}

const THREAD_FIELDS: ReadonlyArray<{
    title: string;
    pick: (c: DiscordChannel) => string | null;
}> = [
    {
        title: "Archived",
        pick: (c) => {
            if (c.thread_archived === null) return null;
            return c.thread_archived ? "yes" : "no";
        },
    },
    {
        title: "Locked",
        pick: (c) => {
            if (c.thread_locked === null) return null;
            return c.thread_locked ? "yes" : "no";
        },
    },
    {
        title: "Auto-archive (minutes)",
        pick: (c) => (c.thread_auto_archive_duration === null ? null : String(c.thread_auto_archive_duration)),
    },
    {
        title: "Archived at",
        pick: (c) => (c.thread_archive_timestamp === null ? null : formatTimestamp(c.thread_archive_timestamp)),
    },
    { title: "Message count", pick: (c) => (c.thread_message_count === null ? null : String(c.thread_message_count)) },
];

export function threadChannelSections(channel: DiscordChannel): Instance[] {
    const out: Instance[] = [];
    for (const { title, pick } of THREAD_FIELDS) {
        const value = pick(channel);
        if (value !== null) out.push(buildReadonlySection({ title, value }));
    }
    return out;
}
