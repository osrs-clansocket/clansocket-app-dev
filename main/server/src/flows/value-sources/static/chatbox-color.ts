import { registerValueSource } from "../../registries/value-source-registry.js";

registerValueSource({
    format: "chatbox-color",
    label: "OSRS chatbox color",
    staticValues: [
        { id: "ffffff", name: "White" },
        { id: "ffcc33", name: "Gold" },
        { id: "ff0000", name: "Red" },
        { id: "00ff00", name: "Green" },
        { id: "00ffff", name: "Cyan" },
        { id: "ff00ff", name: "Magenta" },
        { id: "ffff00", name: "Yellow" },
        { id: "ff8000", name: "Orange" },
        { id: "8080ff", name: "Light blue" },
    ],
});
