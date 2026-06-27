import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "parallel",
    label: "Parallel",
    color: "yellow",
    reads_event: false,
    reads_live_entity: false,
    yields_execution: false,
    default_output_handles: ["branch_a", "branch_b"],
});
