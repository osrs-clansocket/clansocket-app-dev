import { textField } from "./shaper-schema.js";
import type { ActionSchema, FieldConstraint } from "./types-schema.js";

export const META_SCHEMA: ActionSchema = {
    "meta.title": textField(70, "Page title (browser tab)"),
    "meta.description": textField(160, "Search engine description"),
    "meta.keywords": textField(200),
    "meta.author": textField(60),
    "meta.lang": { type: "text", maxLength: 5, defaultValue: "en" },
    "meta.favicon": { type: "url", maxLength: 500 },
    "meta.og_title": textField(70),
    "meta.og_description": textField(200),
    "meta.og_image": { type: "url", maxLength: 500 },
    "meta.og_url": { type: "url", maxLength: 500 },
    "meta.og_type": { type: "enum", enumValues: ["website", "article", "profile"], defaultValue: "website" },
    "meta.canonical": { type: "url", maxLength: 500 },
    "meta.theme_color": { type: "color" },
};

export const PRESET_SCHEMA: FieldConstraint = {
    type: "color",
    description: "Color preset value (hex)",
};
