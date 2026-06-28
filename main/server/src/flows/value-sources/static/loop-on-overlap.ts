import { registerValueSource } from "../../registries/value-source-registry.js";

registerValueSource({
    format: "loop-on-overlap",
    label: "Loop overlap policy",
    staticValues: [
        { id: "skip", name: "Skip if previous still running" },
        { id: "queue", name: "Queue and run after previous" },
        { id: "cancel", name: "Cancel previous and start new" },
    ],
});
