import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "ph",
    config: { baseClass: "ph", label: "Phosphor Icons", license: "MIT", attribution: null, kind: "svg" },
    glyphLoader: async () => (await import("../../ph.json")).default as readonly string[],
});
