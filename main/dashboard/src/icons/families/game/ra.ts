import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "ra",
    config: { baseClass: "ra", label: "RPG Awesome", license: "SIL OFL 1.1", attribution: null, kind: "font" },
    pathsLoader: async () => (await import("../../ra-paths.json")).default,
    cssLoader: () => import("../../../styles/auto-gen/icons/ra.css"),
    glyphLoader: async () => (await import("../../ra.json")).default as Record<string, number>,
});
