import { div, image, paragraph, span, type Instance, baseProps, textProps } from "../../../factory";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import { interpolate, type HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import { isDefaultIconKey } from "../../../../state/clans/homepage/homepage-default-scaffold.js";
import type { EditorState } from "./homepage-editor-state.js";
import { COMPONENT_IMAGE_CLASS, TEXT_DISPLAY_CLASS } from "./component-classes.js";
import { buildKpiPartEditable, buildTextHostPair } from "./component-text-edit.js";

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

function resolveImageSrc(ctx: HomepageContext, c: HomepageComponent): string {
    const key = c.payload.imageKey;
    if (key === undefined || isDefaultIconKey(key)) return ctx.iconUrl;
    const v = c.payload.imageVersion ?? 0;
    return `/api/clans/${encodeURIComponent(ctx.clan.slug)}/homepage/images/${encodeURIComponent(key)}?v=${v}`;
}

function buildKpi(ctx: HomepageContext, c: HomepageComponent, editor: EditorState | null): Instance[] {
    if (editor === null) {
        const label = interpolate(c.payload.label ?? "", ctx);
        const value = interpolate(c.payload.value ?? "", ctx);
        return [span(textProps([KPI_LABEL_CLASS], label)), span(textProps([KPI_VALUE_CLASS], value))];
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
            const text = interpolate(c.payload.text ?? "", ctx);
            return paragraph(textProps([TEXT_DISPLAY_CLASS], text));
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
    return null;
}
