import { BaseRegistry } from "../base/base-registry.js";
import type { PublisherRegistration } from "./publisher-types.js";

export const publisherRegistry = new BaseRegistry<string, PublisherRegistration>();

function publishKey(opKind: string, targetKind: string): string {
    return `${opKind}:${targetKind}`;
}

export function registerPublisher(opKind: string, targetKind: string, registration: PublisherRegistration): void {
    publisherRegistry.register(publishKey(opKind, targetKind), registration);
}

export function lookupPublisher(opKind: string, targetKind: string): PublisherRegistration | undefined {
    return publisherRegistry.get(publishKey(opKind, targetKind));
}
