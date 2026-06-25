import { AppRoutes } from "../../../managers/router/types.js";
import { manageSlug, matchManage } from "../../../managers/router/slug-paths.js";
import { defineRoute } from "../../../managers/router/registry.js";
import { authState } from "../../../managers/auth-state.js";

defineRoute({
    path: AppRoutes.CLAN_MANAGE,
    match: matchManage,
    description: "Clan management (manager-only; non-managers are redirected to the clan dashboard).",
    example: "/clans/varietyz/manage/audit",
    seo: {
        title: "Manage Clan",
        description: "Clan management tools for clan managers.",
        hidden: true,
    },
    guard: async (path) => {
        if (!authState.isAuthed()) return false;
        const slug = manageSlug(path);
        if (slug.length === 0) return false;
        const { clansClient } = await import("../../../state/clans/clans-client/index.js");
        return (await clansClient.checkManagerStatus(slug)).isManager;
    },
    onReject: (path) => {
        const slug = manageSlug(path);
        return slug.length > 0 ? `/clans/${slug}` : "/";
    },
    render: async (path) => (await import("../../pages/routes/render-manage.js")).renderClanManage(path),
});
