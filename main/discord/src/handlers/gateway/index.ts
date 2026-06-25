import type { Client } from "discord.js";
import { wireListeners } from "./dispatch.js";
import "./listeners/_loader.js";
import { listListeners } from "./listener-registry.js";

export function wireGatewayListeners(client: Client): void {
    wireListeners(client, listListeners());
}
