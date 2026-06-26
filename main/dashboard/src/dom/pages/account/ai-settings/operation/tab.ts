import { POLICY } from "../../../../../ai/persona-store/index.js";
import { OPERATION_TAB } from "../../../../../state/ai-settings/panel-defs.js";
import { mountConcernsTab } from "../shared.js";
import type { Instance } from "../../../../factory";

export function mount(host: Instance): void {
    mountConcernsTab({
        host,
        config: OPERATION_TAB,
        tiers: [POLICY],
        tierLabel: "operation",
        tabClass: "account-ai-settings__operation",
    });
}
