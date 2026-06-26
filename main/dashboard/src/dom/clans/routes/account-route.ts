import { AppRoutes } from "../../../managers/router/types.js";
import { defineRoute } from "../../../managers/router/registry.js";
import { authState } from "../../../managers/auth-state.js";

defineRoute({
    path: AppRoutes.ACCOUNT,
    description: "Your account — clans, RSNs, linked accounts, sign-in devices, vault.",
    seo: {
        title: "Your Account",
        description: "Your ClanSocket account, clans, RSNs, linked accounts, and devices.",
        hidden: true,
    },
    nav: { key: "account", title: "Account", icon: "person-circle", order: 20, requiresAuth: true },
    guard: () => authState.isAuthed(),
    onReject: AppRoutes.HOME,
    render: async () => (await import("../../pages/account/index.js")).renderAccount(),
});
