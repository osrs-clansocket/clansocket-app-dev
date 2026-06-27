import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "delay",
    label: "Delay",
    color: "purple",
    reads_event: false,
    reads_live_entity: false,
    yields_execution: true,
    default_output_handles: ["next"],
});
