import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "gi",
    config: {
        baseClass: "gi",
        label: "Game-Icons.net",
        license: "CC BY 3.0",
        attribution: "Icons from game-icons.net (CC BY 3.0)",
        kind: "svg",
    },
    glyphLoader: async () => (await import("../../gi.json")).default as readonly string[],
});
