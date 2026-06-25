import type { Client } from "discord.js";
import type { PendingOutboundRow } from "../loaders/outbound-loader.js";
import { BaseRegistry } from "../base/base-registry.js";

export type Sender = (client: Client, event: PendingOutboundRow) => Promise<string | null>;

export const senderRegistry = new BaseRegistry<string, Sender>();

export function registerSender(kind: string, fn: Sender): void {
    senderRegistry.register(kind, fn);
}

export function lookupSender(kind: string): Sender | undefined {
    return senderRegistry.get(kind);
}
