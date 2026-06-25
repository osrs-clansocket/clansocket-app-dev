import type { Client } from "discord.js";
import type { PendingOutboundRow } from "../../loaders/outbound-loader.js";
import { parseAndSanitize } from "../components-v2-sanitizer.js";
import { registerSender } from "../sender-registry.js";
import { senderTargetId } from "../sender-target.js";

export const KIND_CHANNEL_MESSAGE = "channel_message";

export async function senderChannelMessage(client: Client, event: PendingOutboundRow): Promise<string | null> {
    const targetId = senderTargetId(event, KIND_CHANNEL_MESSAGE);
    const channel = await client.channels.fetch(targetId);
    if (!channel || !channel.isTextBased()) throw new Error(`invalid channel target: ${targetId}`);
    const payload = parseAndSanitize(event.payload_json);
    const msg = await (channel as any).send(payload);
    return msg?.id ?? null;
}

registerSender(KIND_CHANNEL_MESSAGE, senderChannelMessage);
