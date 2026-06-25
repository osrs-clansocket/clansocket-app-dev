import { POLICY } from "../../../../../ai/persona-store/index.js";
import { OPERATION_TAB } from "../../../../../state/ai-settings/panel-defs.js";
import { mountConcernsTab } from "../shared.js";
import { defineTab } from "../registry.js";

defineTab({
    key: "operation",
    label: "Operation",
    order: 50,
    mount: (host) =>
        mountConcernsTab({
            host,
            config: OPERATION_TAB,
            tiers: [POLICY],
            tierLabel: "operation",
            tabClass: "account-ai-settings__operation",
        }),
});
