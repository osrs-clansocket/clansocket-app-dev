import type { DeltaBatch, SnapshotBaseline } from "@clansocket/realtime";

export function openServersStream(slug: string, onEvent: () => void): () => void {
    const url = `/api/discord/clans/${encodeURIComponent(slug)}/servers/stream`;
    const source = new EventSource(url);
    source.addEventListener("servers", onEvent);
    return () => source.close();
}

interface ProjectionFrame {
    snapshot?: SnapshotBaseline;
    topic?: string;
    fromSeq?: number;
    toSeq?: number;
    deltas?: unknown[];
}

function openProjectionStream(
    url: string,
    onSnapshot: (snap: SnapshotBaseline) => void,
    onDelta: (batch: DeltaBatch) => void,
): () => void {
    const source = new EventSource(url);
    source.addEventListener("message", (e) => {
        const msg = JSON.parse(e.data) as ProjectionFrame;
        if (msg.snapshot) {
            onSnapshot(msg.snapshot);
            return;
        }
        if (msg.topic !== undefined && msg.deltas !== undefined) onDelta(msg as DeltaBatch);
    });
    return () => source.close();
}

type StreamFn = (snap: SnapshotBaseline) => void;
type DeltaFn = (batch: DeltaBatch) => void;

export function openChannelsStream(guildId: string, onSnapshot: StreamFn, onDelta: DeltaFn): () => void {
    return openProjectionStream(`/api/discord/channels/${encodeURIComponent(guildId)}/stream`, onSnapshot, onDelta);
}
export function openRolesStream(guildId: string, onSnapshot: StreamFn, onDelta: DeltaFn): () => void {
    return openProjectionStream(`/api/discord/roles/${encodeURIComponent(guildId)}/stream`, onSnapshot, onDelta);
}
export function openMembersStream(guildId: string, onSnapshot: StreamFn, onDelta: DeltaFn): () => void {
    return openProjectionStream(`/api/discord/members/${encodeURIComponent(guildId)}/stream`, onSnapshot, onDelta);
}
export function openWebhooksStream(guildId: string, onSnapshot: StreamFn, onDelta: DeltaFn): () => void {
    return openProjectionStream(`/api/discord/webhooks/${encodeURIComponent(guildId)}/stream`, onSnapshot, onDelta);
}
export function openEmojisStream(guildId: string, onSnapshot: StreamFn, onDelta: DeltaFn): () => void {
    return openProjectionStream(
        `/api/discord/server-emojis/${encodeURIComponent(guildId)}/stream`,
        onSnapshot,
        onDelta,
    );
}
export function openStickersStream(guildId: string, onSnapshot: StreamFn, onDelta: DeltaFn): () => void {
    return openProjectionStream(
        `/api/discord/server-stickers/${encodeURIComponent(guildId)}/stream`,
        onSnapshot,
        onDelta,
    );
}
export function openSettingsStream(guildId: string, onSnapshot: StreamFn, onDelta: DeltaFn): () => void {
    return openProjectionStream(
        `/api/discord/guild-settings/${encodeURIComponent(guildId)}/stream`,
        onSnapshot,
        onDelta,
    );
}
export function openOverwritesStream(guildId: string, onSnapshot: StreamFn, onDelta: DeltaFn): () => void {
    return openProjectionStream(
        `/api/discord/channel-overwrites/${encodeURIComponent(guildId)}/stream`,
        onSnapshot,
        onDelta,
    );
}
