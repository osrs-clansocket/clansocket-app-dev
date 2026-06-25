import { createFetchStore, type FetchStore } from "../stores/lazy-store.js";
import { fetchChannelPins, type DiscordChannelPin } from "./client.js";
import type { ReadSignal } from "../../dom/factory/reactive";

const NEVER_AUTO_REFRESH = (): (() => void) => () => undefined;

export type ChannelPinsStore = FetchStore & { readonly pins$: ReadSignal<readonly DiscordChannelPin[] | null> };

export function channelPinsStore(guildId: string, channelId: string): ChannelPinsStore {
    return createFetchStore<readonly DiscordChannelPin[] | null, "pins$">({
        key: "pins$",
        initial: null,
        load: async () => fetchChannelPins(guildId, channelId),
        subscribe: NEVER_AUTO_REFRESH,
    });
}
