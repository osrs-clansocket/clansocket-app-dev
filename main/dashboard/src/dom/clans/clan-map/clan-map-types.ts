import type { ReadSignal } from "../../factory/reactive/index.js";
import type { PositionsState } from "../../../state/clans/stores/positions-store.js";
import type { div } from "../../factory/layout-ops";

export interface ClanMapProps {
    positions$: ReadSignal<PositionsState>;
}

export interface ClanMapApi {
    host: ReturnType<typeof div>;
    focusOnHash: (hash: string) => void;
    toggleFollow: (hash: string) => void;
    toggleAlert: (hash: string) => void;
    followedHash$: ReadSignal<string | null>;
    alertedHashes$: ReadSignal<ReadonlySet<string>>;
}
