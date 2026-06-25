import type { Client } from "discord.js";
import type { PendingOutboundRow } from "../../loaders/outbound-loader.js";
import { parseAndSanitize } from "../components-v2-sanitizer.js";
import { registerSender } from "../sender-registry.js";
import { senderTargetId } from "../sender-target.js";

export const KIND_DM = "dm";

export async function senderDirectMessage(client: Client, event: PendingOutboundRow): Promise<string | null> {
    const targetId = senderTargetId(event, KIND_DM);
    const user = await client.users.fetch(targetId);
    const dm = await user.createDM();
    const payload = parseAndSanitize(event.payload_json);
    const msg = await dm.send(payload);
    return msg?.id ?? null;
}

registerSender(KIND_DM, senderDirectMessage);
