import { defineIconFamily } from "../../registry";

defineIconFamily({
    prefix: "lu",
    config: { baseClass: "lucide", label: "Lucide", license: "ISC", attribution: null, kind: "font" },
    pathsLoader: async () => (await import("../../lu-paths.json")).default,
    cssLoader: () => import("../../../styles/auto-gen/icons/lu.css"),
    glyphLoader: async () => (await import("../../lu.json")).default as Record<string, number>,
});
