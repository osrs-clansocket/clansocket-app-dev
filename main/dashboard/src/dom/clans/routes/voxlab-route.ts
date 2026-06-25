import { AppRoutes } from "../../../managers/router/types.js";
import { voxlabSlug, matchVoxlab } from "../../../managers/router/slug-paths.js";
import { defineRoute } from "../../../managers/router/registry.js";
import { authState } from "../../../managers/auth-state.js";

defineRoute({
    path: AppRoutes.CLAN_VOXLAB,
    match: matchVoxlab,
    description: "Voxlab — clan logo editor (manager-only; mounts the VoxlabEditor over the clan's current logo).",
    example: "/clans/varietyz/voxlab",
    seo: {
        title: "Voxlab Editor",
        description: "Logo editor for clan brand assets.",
        hidden: true,
    },
    guard: async (path) => {
        if (!authState.isAuthed()) return false;
        const slug = voxlabSlug(path);
        if (slug.length === 0) return false;
        const { clansClient } = await import("../../../state/clans/clans-client/index.js");
        return (await clansClient.checkManagerStatus(slug)).isManager;
    },
    onReject: (path) => {
        const slug = voxlabSlug(path);
        return slug.length > 0 ? `/clans/${slug}` : "/";
    },
    render: async (path) => (await import("../../pages/voxlab/index.js")).renderVoxlab(path),
});
