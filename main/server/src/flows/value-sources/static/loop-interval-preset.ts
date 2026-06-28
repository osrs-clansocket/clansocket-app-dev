import { registerValueSource } from "../../registries/value-source-registry.js";

registerValueSource({
    format: "loop-interval-preset",
    label: "Loop interval values",
    staticValues: [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120].map((n) => ({ id: String(n), name: String(n) })),
});
