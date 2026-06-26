import { AppRoutes } from "../../../managers/router/types.js";
import { defineRoute } from "../../../managers/router/registry.js";
import { matchAiSettings } from "../../../managers/router/slug-paths.js";
import { authState } from "../../../managers/auth-state.js";

defineRoute({
    path: AppRoutes.AI_SETTINGS,
    match: matchAiSettings,
    description: "Your AI settings — memory, modes, persona, operation, preferences.",
    example: "/ai-settings/persona",
    seo: {
        title: "AI Settings",
        description: "Tune ClanSocket AI memory, modes, persona, operation, and preferences.",
        hidden: true,
    },
    nav: { key: "ai-settings", title: "AI Settings", icon: "gear-fill", order: 25, requiresAuth: true },
    guard: () => authState.isAuthed(),
    onReject: AppRoutes.HOME,
    render: async (path) => (await import("../../pages/ai-settings/index.js")).renderAiSettings(path),
});
