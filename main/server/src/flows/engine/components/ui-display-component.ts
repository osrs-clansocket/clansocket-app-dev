import { registerComponent } from "./component-registry.js";

registerComponent({
    kind: "ui-display",
    label: "UI display",
    color: "blue",
    reads_event: false,
    reads_live_entity: false,
    yields_execution: false,
    default_output_handles: ["next"],
});
