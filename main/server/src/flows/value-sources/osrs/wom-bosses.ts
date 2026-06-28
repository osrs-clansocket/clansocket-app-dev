import { Boss } from "@wise-old-man/utils";
import { registerValueSource } from "../../registries/value-source-registry.js";

function humanize(s: string): string {
    return s
        .split("_")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

registerValueSource({
    format: "osrs-boss",
    label: "OSRS bosses",
    staticValues: Object.values(Boss).map((b: string) => ({ id: b, name: humanize(b) })),
});
