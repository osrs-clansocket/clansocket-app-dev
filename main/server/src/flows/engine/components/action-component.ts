import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "action",
    label: "Action",
    color: "capability",
    reads_event: false,
    reads_live_entity: true,
    yields_execution: false,
    default_output_handles: ["next"],
});
