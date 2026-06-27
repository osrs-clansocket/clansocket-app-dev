import { div, effect, span, type Instance, baseProps, textProps } from "../../../factory";
import { setDynProps } from "../../../../state/dynamic-styles.js";
import type { EditorState } from "./homepage-editor-state.js";
import { popoverCloseBtn } from "./homepage-popover-close.js";

const PANEL_CLASS = "clans-home__override-panel";
const HEAD_CLASS = "clans-home__override-head";
const ROW_CLASS = "clans-home__override-row";
const PROP_CLASS = "clans-home__override-prop";
const VALUE_CLASS = "clans-home__override-value";
const SWATCH_CLASS = "clans-home__override-swatch";
const RESET_CLASS = "clans-home__override-reset";
const EMPTY_CLASS = "clans-home__override-empty";

const COLOR_PROPS: ReadonlySet<string> = new Set(["--color", "--background", "--border-color"]);

function shortValue(value: string): string {
    const match = value.match(/var\(--([a-z0-9-]+)\)/i);
    return match ? match[1] : value;
}

function buildRow(state: EditorState, id: string, property: string, value: string): Instance {
    const isColor = COLOR_PROPS.has(property);
    const swatch = div(baseProps([SWATCH_CLASS]));
    if (isColor) setDynProps(swatch.el, { "--swatch-color": value });
    return div(baseProps([ROW_CLASS]), [
        span(textProps([PROP_CLASS], property)),
        isColor ? swatch : span(textProps([VALUE_CLASS], shortValue(value))),
        div(
            {
                classes: [RESET_CLASS],
                ariaLabel: `Reset ${property}`,
                title: "Reset",
                context: `reset ${property} on this component`,
                meta: ["action"],
                onClick: () => state.clearTokenOverride(id, property),
            },
            [span(textProps(["clans-home__override-reset-text"], "reset"))],
        ),
    ]);
}

export function buildOverrideList(state: EditorState, id: string, onClose: () => void): Instance {
    const panel = div(baseProps([PANEL_CLASS]));
    panel.trackDispose(
        effect(() => {
            panel.setChildren();
            const comp = state.draft$().find((c) => c.componentId === id);
            const entries = Object.entries(comp?.tokenOverrides ?? {});
            panel.addChild(
                div(baseProps([HEAD_CLASS]), [
                    span(textProps(["clans-home__override-title"], "Overrides")),
                    span(textProps(["clans-home__override-count"], String(entries.length))),
                    popoverCloseBtn(onClose),
                ]),
            );
            if (entries.length === 0) {
                panel.addChild(span(textProps([EMPTY_CLASS], "No overrides applied")));
                return;
            }
            for (const [prop, value] of entries) panel.addChild(buildRow(state, id, prop, value));
        }),
    );
    return panel;
}
