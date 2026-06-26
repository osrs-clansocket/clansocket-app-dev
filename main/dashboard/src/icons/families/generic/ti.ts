import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "ti",
    config: { baseClass: "ti", label: "Tabler Icons", license: "MIT", attribution: null, kind: "svg" },
    glyphLoader: async () => (await import("../../ti.json")).default as readonly string[],
});
