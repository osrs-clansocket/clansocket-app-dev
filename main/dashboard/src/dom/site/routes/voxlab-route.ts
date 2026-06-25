import { defineRoute } from "../../../managers/router/registry.js";

defineRoute({
    path: "/voxlab",
    description: "Site voxlab — main logo editor (site-owner only).",
    seo: {
        title: "Voxlab Editor",
        description: "Site-owner logo editor.",
        hidden: true,
    },
    guard: async () => {
        const { ownerStatus } = await import("../../../state/site/site-client.js");
        const status = await ownerStatus();
        return status.isOwner;
    },
    onReject: "/",
    render: async () => (await import("../../pages/voxlab/index.js")).renderVoxlab("/voxlab"),
});
