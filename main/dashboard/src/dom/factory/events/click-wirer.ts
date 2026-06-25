import type { ClickProp } from "./handler-types.js";
import { resolveProp } from "./prop-resolver.js";
import { passesClickGate } from "./click-gate.js";
import { runGuarded } from "./guarded-runner.js";

export function wireClick(el: HTMLElement, prop: ClickProp): void {
    const { handler, options, raw } = resolveProp(prop);
    if (raw) {
        el.addEventListener("click", handler as EventListener, options);
        return;
    }
    el.addEventListener(
        "click",
        (e: MouseEvent) => {
            if (!passesClickGate()) {
                e.stopImmediatePropagation();
                e.preventDefault();
                return;
            }
            runGuarded(el as HTMLButtonElement, e, handler);
        },
        options,
    );
}
