import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "bi",
    config: { baseClass: "bi", label: "Bootstrap Icons", license: "MIT", attribution: null, kind: "font" },
    pathsLoader: async () => (await import("../../bi-paths.json")).default,
    cssLoader: () => import("../../../styles/auto-gen/icons.css"),
    glyphLoader: async () => (await import("../../bi.json")).default as Record<string, number>,
});
