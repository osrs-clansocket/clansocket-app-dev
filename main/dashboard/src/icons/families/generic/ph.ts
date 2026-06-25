import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "ph",
    config: { baseClass: "ph", label: "Phosphor Icons", license: "MIT", attribution: null, kind: "font" },
    pathsLoader: async () => (await import("../../ph-paths.json")).default,
    cssLoader: () => import("../../../styles/auto-gen/icons/ph.css"),
    glyphLoader: async () => (await import("../../ph.json")).default as Record<string, number>,
});
