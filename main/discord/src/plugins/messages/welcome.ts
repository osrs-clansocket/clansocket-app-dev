import { messageRegistry } from "../plugin-registry.js";

const GUILD_MEMBER_JOIN = 7;
const PLUGIN_NAME = "welcome";

messageRegistry.register(PLUGIN_NAME, {
    type: "message",
    name: PLUGIN_NAME,

    filter(message: any) {
        return message.type === GUILD_MEMBER_JOIN;
    },

    async execute(message: any) {
        await message.channel.send(`Welcome ${message.author}!`);
    },
});
