import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "join",
    label: "Join",
    color: "yellow",
    reads_event: false,
    reads_live_entity: false,
    yields_execution: false,
    default_output_handles: ["next"],
});
