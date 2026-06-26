import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "bi",
    config: { baseClass: "bi", label: "Bootstrap Icons", license: "MIT", attribution: null, kind: "svg" },
    glyphLoader: async () => (await import("../../bi.json")).default as readonly string[],
});
