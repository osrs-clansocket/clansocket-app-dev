import { registerValueSource } from "../../registries/value-source-registry.js";

registerValueSource({
    format: "loop-interval-unit",
    label: "Loop interval units",
    staticValues: [
        { id: "minutes", name: "Minutes" },
        { id: "hours", name: "Hours" },
        { id: "days", name: "Days" },
        { id: "weeks", name: "Weeks" },
    ],
});
