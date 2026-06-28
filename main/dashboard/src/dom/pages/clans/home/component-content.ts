import { div, effect, image, paragraph, span, type Instance, baseProps, textProps } from "../../../factory";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import { interpolate, type HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import { isDefaultIconKey } from "../../../../state/clans/homepage/homepage-default-scaffold.js";
import type { EditorState } from "./homepage-editor-state.js";
import { COMPONENT_IMAGE_CLASS, TEXT_DISPLAY_CLASS } from "./component-classes.js";
import { buildKpiPartEditable, buildTextHostPair } from "./component-text-edit.js";
import { buildChart } from "./component-chart.js";

const KPI_LABEL_CLASS = "clans-home__kpi-label";
const KPI_VALUE_CLASS = "clans-home__kpi-value";

function isImageKind(c: HomepageComponent): boolean {
    return c.componentName === "image";
}

function isTextKind(c: HomepageComponent): boolean {
    return c.componentName === "heading" || c.componentName === "paragraph";
}

function isKpiKind(c: HomepageComponent): boolean {
    return c.componentName === "kpi";
}

function isContainerKind(c: HomepageComponent): boolean {
    return c.componentName === "container";
}

function isChartKind(c: HomepageComponent): boolean {
    return c.componentName === "chart";
}

function resolveImageSrc(ctx: HomepageContext, c: HomepageComponent): string {
    const key = c.payload.imageKey;
    if (key === undefined || isDefaultIconKey(key)) return ctx.iconUrl;
    const v = c.payload.imageVersion ?? 0;
    return `/api/clans/${encodeURIComponent(ctx.clan.slug)}/homepage/images/${encodeURIComponent(key)}?v=${v}`;
}

function reactiveText(ctx: HomepageContext, raw: string, classes: readonly string[]): Instance {
    const node = paragraph(textProps(classes, ""));
    node.trackDispose(
        effect(() => {
            node.setText(interpolate(raw, ctx));
        }),
    );
    return node;
}

function reactiveSpan(ctx: HomepageContext, raw: string, cls: string): Instance {
    const node = span(textProps([cls], ""));
    node.trackDispose(
        effect(() => {
            node.setText(interpolate(raw, ctx));
        }),
    );
    return node;
}

function buildKpi(ctx: HomepageContext, c: HomepageComponent, editor: EditorState | null): Instance[] {
    if (editor === null) {
        return [
            reactiveSpan(ctx, c.payload.label ?? "", KPI_LABEL_CLASS),
            reactiveSpan(ctx, c.payload.value ?? "", KPI_VALUE_CLASS),
        ];
    }
    return [
        buildKpiPartEditable(ctx, c, editor, "label", KPI_LABEL_CLASS),
        buildKpiPartEditable(ctx, c, editor, "value", KPI_VALUE_CLASS),
    ];
}

export function buildContent(
    ctx: HomepageContext,
    c: HomepageComponent,
    editor: EditorState | null,
): Instance | Instance[] | null {
    if (isTextKind(c)) {
        if (editor === null) {
            return reactiveText(ctx, c.payload.text ?? "", [TEXT_DISPLAY_CLASS]);
        }
        return buildTextHostPair(ctx, c, editor);
    }
    if (isImageKind(c)) {
        return image({
            src: resolveImageSrc(ctx, c),
            alt: "",
            classes: [COMPONENT_IMAGE_CLASS],
            context: null,
            meta: null,
        });
    }
    if (isKpiKind(c)) {
        return buildKpi(ctx, c, editor);
    }
    if (isContainerKind(c)) {
        return div(baseProps(["clans-home__container-body"]));
    }
    if (isChartKind(c)) {
        return buildChart(ctx, c);
    }
    return null;
}
