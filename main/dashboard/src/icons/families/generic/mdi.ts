import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "mdi",
    config: {
        baseClass: "mdi",
        label: "Material Design Icons",
        license: "Apache 2.0",
        attribution: null,
        kind: "font",
    },
    pathsLoader: async () => (await import("../../mdi-paths.json")).default,
    cssLoader: () => import("../../../styles/auto-gen/icons/mdi.css"),
    glyphLoader: async () => (await import("../../mdi.json")).default as Record<string, number>,
});
