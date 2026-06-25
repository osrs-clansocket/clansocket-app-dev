import type { ActionResult, InstanceActionSpec } from "../action-types.js";
import { withFoundElement } from "./element-runner.js";
import { whenInstance } from "./instance-narrower.js";
import { fail } from "./result-builder.js";

export function makeElementAction<TArg>(
    verb: string,
    getKey: (arg: TArg) => string,
    handler: (el: HTMLElement, arg: TArg) => ActionResult,
): (arg: TArg) => ActionResult {
    return (arg) => withFoundElement(getKey(arg), verb, (el) => handler(el, arg));
}

export function makeInstanceAction<TArg, E extends HTMLElement>({
    verb,
    getKey,
    ctor,
    err,
    handler,
}: InstanceActionSpec<TArg, E>): (arg: TArg) => ActionResult {
    return makeElementAction(verb, getKey, (el, arg) =>
        whenInstance(
            el,
            ctor,
            (typed) => handler(typed, arg),
            () => fail(verb, getKey(arg), err),
        ),
    );
}
