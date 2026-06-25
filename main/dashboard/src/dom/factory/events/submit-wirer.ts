import type { SubmitProp } from "./handler-types.js";
import { resolveProp } from "./prop-resolver.js";
import { runGuarded } from "./guarded-runner.js";

export function wireSubmit(el: HTMLFormElement, prop: SubmitProp): void {
    const { handler, options, raw } = resolveProp(prop);
    if (raw) {
        el.addEventListener("submit", handler as EventListener, options);
        return;
    }
    el.addEventListener(
        "submit",
        (e: SubmitEvent) => {
            e.preventDefault();
            runGuarded(el, e, handler);
        },
        options,
    );
}
