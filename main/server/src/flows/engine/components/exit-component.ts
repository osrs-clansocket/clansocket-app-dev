import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "exit",
    label: "Exit",
    color: "red",
    reads_event: false,
    reads_live_entity: false,
    yields_execution: false,
    default_output_handles: [],
});
