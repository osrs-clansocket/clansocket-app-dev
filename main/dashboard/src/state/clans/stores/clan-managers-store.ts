import { listClanManagers, type ClanManagerRow } from "../clans-client/people/index.js";
import { createFetchStore, type FetchStore } from "../../stores/lazy-store.js";
import { dataRightsClient } from "../../data-rights/data-rights-client/index.js";
import type { ReadSignal } from "../../../dom/factory/reactive";

type ClanManagersStore = FetchStore & { readonly managers$: ReadSignal<ClanManagerRow[]> };

export function clanManagersStore(slug: string): ClanManagersStore {
    return createFetchStore<ClanManagerRow[], "managers$">({
        key: "managers$",
        initial: [],
        load: () => listClanManagers(slug),
        subscribe: (refetch) => dataRightsClient.openWritesStream(() => refetch()),
    });
}
