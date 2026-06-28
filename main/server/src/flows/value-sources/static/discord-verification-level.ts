import { registerValueSource } from "../../registries/value-source-registry.js";

registerValueSource({
    format: "discord-verification-level",
    label: "Discord verification levels",
    staticValues: [
        { id: "0", name: "None" },
        { id: "1", name: "Low — verified email" },
        { id: "2", name: "Medium — registered 5+ min" },
        { id: "3", name: "High — member of guild 10+ min" },
        { id: "4", name: "Highest — verified phone" },
    ],
});
