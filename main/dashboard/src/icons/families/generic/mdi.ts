import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "mdi",
    config: {
        baseClass: "mdi",
        label: "Material Design Icons",
        license: "Apache 2.0",
        attribution: null,
        kind: "svg",
    },
    glyphLoader: async () => (await import("../../mdi.json")).default as readonly string[],
});
