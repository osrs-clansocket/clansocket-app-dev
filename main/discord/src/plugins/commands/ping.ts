import { commandRegistry } from "../plugin-registry.js";

const PLUGIN_NAME = "ping";

commandRegistry.register(PLUGIN_NAME, {
    type: "command",
    name: PLUGIN_NAME,
    permission: null,

    async execute(message: any) {
        const sent = await message.reply("Pinging...");
        const latency = sent.createdTimestamp - message.createdTimestamp;
        await sent.edit(`Pong! Latency: ${latency}ms`);
    },
});
