import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "condition",
    label: "Condition",
    color: "orange",
    reads_event: false,
    reads_live_entity: true,
    yields_execution: false,
    default_output_handles: ["yes", "no"],
});
