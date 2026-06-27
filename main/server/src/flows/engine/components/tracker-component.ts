import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "tracker",
    label: "Tracker",
    color: "slate",
    reads_event: false,
    reads_live_entity: false,
    yields_execution: false,
    default_output_handles: ["next"],
});
