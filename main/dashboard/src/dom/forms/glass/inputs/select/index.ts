import {
    div,
    slidePanel,
    span,
    type Instance,
    type SlidePanelInstance,
    baseProps,
    textProps,
} from "../../../../factory/index.js";
import {
    applyFilter,
    buildHiddenInput,
    buildOption,
    buildSearchInput,
    buildSelectTrigger,
    CLASS_GRID,
    CLASS_LABEL,
    CLASS_PANEL,
    CLASS_PANEL_INNER,
    CLASS_ROOT,
    wireSelectClicks,
    type SelectOption,
} from "./parts.js";

const SEARCH_THRESHOLD = 12;

const openInstances = new Set<SlidePanelInstance>();

function composeSlide(trigger: Instance, panel: Instance, onCloseExtra: () => void): SlidePanelInstance {
    let slide: SlidePanelInstance | null = null;
    slide = slidePanel(
        {
            rootClasses: [CLASS_ROOT],
            panelClasses: [CLASS_PANEL],
            onOpen: () => {
                for (const other of openInstances) if (other !== slide) other.close();
                if (slide) openInstances.add(slide);
            },
            onClose: () => {
                if (slide) openInstances.delete(slide);
                onCloseExtra();
            },
            context: null,
            meta: null,
        },
        trigger,
        panel,
    );
    return slide;
}

function buildGlassSelect(
    name: string,
    options: ReadonlyArray<SelectOption>,
    current: string,
    layout: "grid" | "list" = "grid",
): Instance {
    const labelInst = span(textProps([CLASS_LABEL], options.find((o) => o.value === current)?.label ?? current));
    const trigger = buildSelectTrigger(labelInst);
    const hidden = buildHiddenInput(name, current);
    const optionInsts = options.map((o) => buildOption(o, current));
    const gridClasses = layout === "list" ? [CLASS_GRID, `${CLASS_GRID}--list`] : [CLASS_GRID];
    const grid = div({ classes: gridClasses, role: "listbox", context: null, meta: null }, optionInsts);
    const innerChildren: Instance[] =
        options.length >= SEARCH_THRESHOLD ? [buildSearchInput(optionInsts), grid] : [grid];
    const inner = div(baseProps([CLASS_PANEL_INNER]), innerChildren);
    const panel = div(baseProps([]), [inner]);
    const slide = composeSlide(trigger, panel, () => applyFilter("", optionInsts));
    wireSelectClicks(optionInsts, hidden, labelInst, () => slide.close());
    slide.addChild(hidden);
    return slide;
}

export { buildGlassSelect };
export type { SelectOption };
