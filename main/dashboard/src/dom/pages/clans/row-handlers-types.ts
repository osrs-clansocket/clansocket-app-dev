import type { ReadSignal } from "../../factory";

export interface RowHandlers {
    onFocus: (hash: string) => void;
    onToggleFollow: (hash: string) => void;
    onToggleAlert: (hash: string) => void;
    followedHash$: ReadSignal<string | null>;
    alertedHashes$: ReadSignal<ReadonlySet<string>>;
}
