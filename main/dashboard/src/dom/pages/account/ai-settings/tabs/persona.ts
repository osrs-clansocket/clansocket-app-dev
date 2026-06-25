import { IDENTITY } from "../../../../../ai/persona-store/index.js";
import { PERSONA_TAB } from "../../../../../state/ai-settings/panel-defs.js";
import { mountConcernsTab } from "../shared.js";
import { defineTab } from "../registry.js";

defineTab({
    key: "persona",
    label: "Persona",
    order: 40,
    mount: (host) =>
        mountConcernsTab({
            host,
            config: PERSONA_TAB,
            tiers: [IDENTITY],
            tierLabel: "persona",
            tabClass: "account-ai-settings__persona",
        }),
});
