import { IDENTITY } from "../../../../../ai/persona-store/index.js";
import { PERSONA_TAB } from "../../../../../state/ai-settings/panel-defs.js";
import { mountConcernsTab } from "../shared.js";
import type { Instance } from "../../../../factory";

export function mount(host: Instance): void {
    mountConcernsTab({
        host,
        config: PERSONA_TAB,
        tiers: [IDENTITY],
        tierLabel: "persona",
        tabClass: "account-ai-settings__persona",
    });
}
