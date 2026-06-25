import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "ti",
    config: { baseClass: "ti", label: "Tabler Icons", license: "MIT", attribution: null, kind: "font" },
    pathsLoader: async () => (await import("../../ti-paths.json")).default,
    cssLoader: () => import("../../../styles/auto-gen/icons/ti.css"),
    glyphLoader: async () => (await import("../../ti.json")).default as Record<string, number>,
});
