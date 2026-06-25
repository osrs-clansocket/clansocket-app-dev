import { input } from "../../../../factory/index.js";

export function buildHiddenInput(name: string, current: string): ReturnType<typeof input> {
    return input({
        name,
        ariaLabel: "Selected value",
        type: "hidden",
        value: current,
        context: "the selected value (hidden field)",
        meta: ["input"],
    });
}
