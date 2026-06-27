import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "branch",
    label: "Branch",
    color: "yellow",
    reads_event: false,
    reads_live_entity: true,
    yields_execution: false,
    default_output_handles: ["true", "false"],
});
