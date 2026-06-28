import { registerValueSource } from "../../registries/value-source-registry.js";

registerValueSource({
    format: "discord-channel-type",
    label: "Discord channel types",
    staticValues: [
        { id: "0", name: "Text channel" },
        { id: "2", name: "Voice channel" },
        { id: "4", name: "Category" },
        { id: "5", name: "Announcement channel" },
        { id: "13", name: "Stage channel" },
        { id: "15", name: "Forum channel" },
    ],
});
