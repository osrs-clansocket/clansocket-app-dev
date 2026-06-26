import { DOMAIN, ENGAGEMENT } from "../../../../../ai/persona-store/index.js";
import { PREFERENCES_TAB } from "../../../../../state/ai-settings/panel-defs.js";
import { mountConcernsTab } from "../shared.js";
import type { Instance } from "../../../../factory";

export function mount(host: Instance): void {
    mountConcernsTab({
        host,
        config: PREFERENCES_TAB,
        tiers: [ENGAGEMENT, DOMAIN],
        tierLabel: "preferences",
        tabClass: "account-ai-settings__preferences",
    });
}
