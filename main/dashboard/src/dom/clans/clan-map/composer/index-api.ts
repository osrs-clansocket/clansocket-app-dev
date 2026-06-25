import type { Instance } from "../../../factory/core";
import { toggleAlert, toggleFollow } from "../internal/actions.js";
import { focusOn } from "./index-focus.js";
import type { MapStateSignals } from "../internal/state.js";
import type { ClanMapApi, ClanMapProps } from "../clan-map-types.js";

export function buildApi(state: MapStateSignals, props: ClanMapProps, host: Instance): ClanMapApi {
    return {
        host,
        focusOnHash: (hash: string) => focusOn(state, props, hash),
        toggleFollow: (hash: string) => toggleFollow(state, hash),
        toggleAlert: (hash: string) => toggleAlert(state, hash),
        followedHash$: state.followedHash$,
        alertedHashes$: state.alertedHashes$,
    };
}
