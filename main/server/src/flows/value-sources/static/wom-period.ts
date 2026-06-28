import { registerValueSource } from "../../registries/value-source-registry.js";

registerValueSource({
    format: "wom-period",
    label: "WOM periods",
    staticValues: [
        { id: "day", name: "Day" },
        { id: "week", name: "Week" },
        { id: "month", name: "Month" },
        { id: "year", name: "Year" },
    ],
});
