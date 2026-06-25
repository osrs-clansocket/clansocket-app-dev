import type { HandlerDescriptor } from "./handler-types.js";

function isDescriptor<T>(prop: T | HandlerDescriptor<T>): prop is HandlerDescriptor<T> {
    return typeof prop === "object" && prop !== null && "handler" in prop;
}

function pickOptions<T>(d: HandlerDescriptor<T>): AddEventListenerOptions {
    const options: AddEventListenerOptions = {};
    if (d.capture !== undefined) options.capture = d.capture;
    if (d.once !== undefined) options.once = d.once;
    if (d.passive !== undefined) options.passive = d.passive;
    return options;
}

export function resolveProp<T>(prop: T | HandlerDescriptor<T>): {
    handler: T;
    options: AddEventListenerOptions;
    raw: boolean;
} {
    if (isDescriptor(prop)) return { handler: prop.handler, options: pickOptions(prop), raw: prop.raw === true };
    return { handler: prop, options: {}, raw: false };
}
