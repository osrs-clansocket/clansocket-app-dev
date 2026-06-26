import { numRange, pxField } from "./shaper-schema.js";
import type { ActionSchema } from "./types-schema.js";

const PADDING_PX_FIELD = pxField(false);
const MARGIN_PX_FIELD = pxField(true);

export const STYLE_SCHEMA: ActionSchema = {
    fontSize: numRange(8, 200, "Font size in px"),
    fontWeight: { type: "enum", enumValues: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] },
    lineHeight: numRange(0.5, 5),
    letterSpacing: numRange(-10, 50),
    textTransform: { type: "enum", enumValues: ["none", "uppercase", "lowercase", "capitalize"] },
    textAlign: { type: "enum", enumValues: ["left", "center", "right", "justify"] },
    color: { type: "color" },
    backgroundColor: { type: "color" },
    opacity: numRange(0, 1),
    borderWidth: numRange(0, 100),
    borderStyle: { type: "enum", enumValues: ["none", "solid", "dashed", "dotted", "double"] },
    borderColor: { type: "color" },
    borderRadius: PADDING_PX_FIELD,
    paddingTop: PADDING_PX_FIELD,
    paddingRight: PADDING_PX_FIELD,
    paddingBottom: PADDING_PX_FIELD,
    paddingLeft: PADDING_PX_FIELD,
    marginTop: MARGIN_PX_FIELD,
    marginRight: MARGIN_PX_FIELD,
    marginBottom: MARGIN_PX_FIELD,
    marginLeft: MARGIN_PX_FIELD,
    width: PADDING_PX_FIELD,
    height: PADDING_PX_FIELD,
    backgroundSize: { type: "enum", enumValues: ["cover", "contain", "auto", "100% 100%"] },
    backgroundPosition: {
        type: "enum",
        enumValues: [
            "center",
            "top",
            "bottom",
            "left",
            "right",
            "top left",
            "top right",
            "bottom left",
            "bottom right",
        ],
    },
    backgroundRepeat: { type: "enum", enumValues: ["no-repeat", "repeat", "repeat-x", "repeat-y", "space"] },
};
