import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "wait-for-event",
    label: "Wait for event",
    color: "cyan",
    reads_event: true,
    reads_live_entity: false,
    yields_execution: true,
    default_output_handles: ["event", "timeout"],
});
