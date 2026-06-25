import { derived, div, effect, span, type Instance } from "../../../../factory";
import { reconcile } from "../../../../factory/live-ops/reconcile.js";
import type { DiscordChannel, DiscordChannelPin } from "../../../../../state/discord/client.js";
import { channelPinsStore } from "../../../../../state/discord/channel-pins-store.js";
import { DISCORD_INSPECTOR_SECTION_CLASS } from "../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { buildLabelRow } from "../../builders/section-builder.js";

const PIN_LIST_CLASS = "clans-manage__channel-pins-list";
const PIN_ITEM_CLASS = "clans-manage__channel-pin-item";
const PIN_META_CLASS = "clans-manage__channel-pin-meta";
const PIN_CONTENT_CLASS = "clans-manage__channel-pin-content";
const PIN_LOADING = "Loading pins…";
const PIN_NONE = "no pinned messages";
const CONTENT_PREVIEW_LIMIT = 280;
const ISO_DATE_END = 16;

function truncateContent(s: string | null): string {
    if (s === null || s.length === 0) return "(no content)";
    if (s.length <= CONTENT_PREVIEW_LIMIT) return s;
    return `${s.slice(0, CONTENT_PREVIEW_LIMIT - 1)}…`;
}

function buildPinItem(p: DiscordChannelPin): Instance {
    const date = new Date(p.timestamp).toISOString().slice(0, ISO_DATE_END).replace("T", " ");
    const author = p.author_name ?? p.author_user_id ?? "unknown";
    return div({ classes: [PIN_ITEM_CLASS], context: null, meta: null }, [
        span({
            classes: [PIN_META_CLASS],
            text: `${author} · ${date}`,
            context: null,
            meta: null,
        }),
        span({
            classes: [PIN_CONTENT_CLASS],
            text: truncateContent(p.content),
            context: null,
            meta: null,
        }),
    ]);
}

function pinMetaText(pins: readonly DiscordChannelPin[] | null): string {
    if (pins === null) return PIN_LOADING;
    if (pins.length === 0) return PIN_NONE;
    return `${pins.length} pinned`;
}

function bindPinsEffect(
    itemsHost: Instance,
    itemState: Map<string, Instance>,
    pins$: () => readonly DiscordChannelPin[] | null,
): void {
    itemsHost.trackDispose(
        effect(() => {
            const pins = pins$();
            if (pins === null || pins.length === 0) {
                for (const inst of itemState.values()) inst.destroy();
                itemState.clear();
                return;
            }
            reconcile<DiscordChannelPin>({
                container: itemsHost,
                state: itemState,
                items: pins,
                keyOf: (p) => p.message_id,
                create: (p) => buildPinItem(p),
            });
        }),
    );
}

export function buildPinsSection(channel: DiscordChannel): Instance {
    const store = channelPinsStore(channel.guild_id, channel.channel_id);
    const meta = span({
        classes: [PIN_META_CLASS],
        text: derived(() => pinMetaText(store.pins$())),
        context: null,
        meta: null,
    });
    const itemsHost = div({ classes: [PIN_LIST_CLASS], context: null, meta: null });
    const itemState = new Map<string, Instance>();
    bindPinsEffect(itemsHost, itemState, store.pins$);
    return div({ classes: [DISCORD_INSPECTOR_SECTION_CLASS], context: null, meta: null }, [
        buildLabelRow("Pinned messages", null),
        meta,
        itemsHost,
    ]);
}
