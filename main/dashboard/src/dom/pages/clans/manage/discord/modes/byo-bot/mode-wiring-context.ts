import type { Instance, SlidePanelInstance } from "../../../../../../factory";
import { storeFor } from "../../../../../../../state/discord-byo-bot/stores/byo-bot-store.js";
import { serversStoreFor } from "../../../../../../../state/discord/servers-store.js";
import type { DiscordServer } from "../../../../../../../state/discord/client.js";

export interface ModeCtx {
    slug: string;
    server: DiscordServer;
    store: ReturnType<typeof storeFor>;
    serversStore: ReturnType<typeof serversStoreFor>;
    content: Instance;
    openPanelRef: { p: SlidePanelInstance | null };
    rebuild: () => void;
}

export function makeTrackHandlers(ctx: ModeCtx): {
    trackOpen: (p: SlidePanelInstance) => void;
    trackClose: () => void;
} {
    return {
        trackOpen: (p) => {
            ctx.openPanelRef.p = p;
        },
        trackClose: () => {
            ctx.openPanelRef.p = null;
            ctx.rebuild();
        },
    };
}

export type Track = ReturnType<typeof makeTrackHandlers>;
