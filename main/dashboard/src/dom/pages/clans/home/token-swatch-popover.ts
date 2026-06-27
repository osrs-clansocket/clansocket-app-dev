import { div, span, type Instance, baseProps, textProps } from "../../../factory";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import { ALLOWED_TOKENS_BY_PROPERTY } from "@clansocket/constants/clan-homepage-tokens";

const POPOVER_CLASS = "clans-home__swatch-popover";
const SWATCH_CLASS = "clans-home__swatch";
const SWATCH_COLOR_CLASS = "clans-home__swatch--color";
const SWATCH_TEXT_CLASS = "clans-home__swatch--text";
const SWATCH_VALUE_CLASS = "clans-home__swatch-value";
const SWATCH_CLEAR_CLASS = "clans-home__swatch-clear";
const POPOVER_HEAD_CLASS = "clans-home__swatch-head";

const COLOR_PROPS: ReadonlySet<string> = new Set(["--color", "--background", "--border-color"]);

function isColorProp(prop: string): boolean {
    return COLOR_PROPS.has(prop);
}

function shortLabel(value: string): string {
    const match = value.match(/var\(--([a-z0-9-]+)\)/i);
    if (match)
        return match[1]
            .replace(/^base-/, "")
            .replace(/^sp-/, "sp ")
            .replace(/^fs-/, "fs ");
    return value;
}

function colorSwatch(prop: string, value: string, onSelect: (v: string) => void): Instance {
    const swatch = div(
        {
            classes: [SWATCH_CLASS, SWATCH_COLOR_CLASS],
            ariaLabel: `Apply ${prop} ${value}`,
            context: `apply ${prop} = ${value}`,
            meta: ["action"],
            onClick: () => onSelect(value),
            title: shortLabel(value),
        },
        [],
    );
    setDynProps(swatch.el, { "--swatch-color": value });
    return swatch;
}

function textSwatch(prop: string, value: string, onSelect: (v: string) => void): Instance {
    return div(
        {
            classes: [SWATCH_CLASS, SWATCH_TEXT_CLASS],
            ariaLabel: `Apply ${prop} ${value}`,
            context: `apply ${prop} = ${value}`,
            meta: ["action"],
            onClick: () => onSelect(value),
            title: shortLabel(value),
        },
        [span(textProps([SWATCH_VALUE_CLASS], shortLabel(value)))],
    );
}

function clearButton(onClear: () => void): Instance {
    return div(
        {
            classes: [SWATCH_CLASS, SWATCH_CLEAR_CLASS],
            ariaLabel: "Reset to default",
            context: "reset this property to the default token",
            meta: ["action"],
            onClick: () => onClear(),
            title: "Reset",
        },
        [span(textProps([SWATCH_VALUE_CLASS], "reset"))],
    );
}

export interface SwatchPopoverOpts {
    property: string;
    onSelect(value: string): void;
    onClear(): void;
}

export function buildSwatchPopover(opts: SwatchPopoverOpts): Instance {
    const { property, onSelect, onClear } = opts;
    const allowed = ALLOWED_TOKENS_BY_PROPERTY[property] ?? [];
    const head = div(baseProps([POPOVER_HEAD_CLASS]), [
        span(textProps(["clans-home__swatch-head-label"], property)),
        clearButton(onClear),
    ]);
    const swatches = allowed.map((value) =>
        isColorProp(property) ? colorSwatch(property, value, onSelect) : textSwatch(property, value, onSelect),
    );
    return div(baseProps([POPOVER_CLASS]), [head, div(baseProps(["clans-home__swatch-grid"]), swatches)]);
}
