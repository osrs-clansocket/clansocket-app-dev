import { registerValueSource } from "../../registries/value-source-registry.js";

registerValueSource({
    format: "mime-type",
    label: "HTTP content types",
    staticValues: [
        { id: "application/json", name: "JSON" },
        { id: "application/x-www-form-urlencoded", name: "Form-urlencoded" },
        { id: "text/plain", name: "Plain text" },
        { id: "text/html", name: "HTML" },
        { id: "application/xml", name: "XML" },
    ],
});
