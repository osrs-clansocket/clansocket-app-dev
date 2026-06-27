import { AppRoutes } from "../../../managers/router/types.js";
import { matchRoster, rosterSlug } from "../../../managers/router/slug-paths.js";
import { defineRoute } from "../../../managers/router/registry.js";

defineRoute({
    path: AppRoutes.CLAN_ROSTER,
    match: matchRoster,
    description: "A clan's roster page. :slug is the clan's lowercase slug.",
    example: "/clans/varietyz/roster",
    seo: async (path) => {
        const slug = rosterSlug(path);
        if (slug.length === 0) return null;
        const { clansClient } = await import("../../../state/clans/clans-client/index.js");
        return clansClient.fetchClanSeo(slug);
    },
    render: async (path) => (await import("../../pages/clans/index.js")).renderClanRoster(path),
});
