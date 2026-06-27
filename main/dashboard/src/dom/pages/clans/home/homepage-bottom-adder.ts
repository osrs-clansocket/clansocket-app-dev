import { div, effect, span, type Instance, baseProps, textProps } from "../../../factory";
import { signal } from "../../../factory/reactive";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { EditorState } from "./homepage-editor-state.js";
import { toolButton } from "./homepage-frame-button.js";

const ADDER_CLASS = "clans-home__bottom-adder";
const TRIGGER_CLASS = "clans-home__bottom-adder-trigger";
const POPOVER_CLASS = "clans-home__bottom-adder-popover";
const POPOVER_OPEN_CLASS = "is-open";
const LABEL_CLASS = "clans-home__bottom-adder-label";

interface KindEntry {
    readonly id: HomepageComponent["componentName"];
    readonly name: string;
    readonly label: string;
}

const KIND_ENTRIES: ReadonlyArray<KindEntry> = [
    { id: "heading", name: "type", label: "Heading" },
    { id: "paragraph", name: "text-paragraph", label: "Paragraph" },
    { id: "image", name: "image", label: "Image" },
    { id: "kpi", name: "info-circle", label: "KPI tile" },
    { id: "container", name: "border", label: "Container" },
    { id: "spacer", name: "arrows-expand", label: "Spacer" },
];

function buildKindButton(state: EditorState, entry: KindEntry, open$: ReturnType<typeof signal<boolean>>): Instance {
    return toolButton({
        name: entry.name,
        label: entry.label,
        active$: () => false,
        onClick: () => {
            state.addComponent(entry.id);
            open$.set(false);
        },
    });
}

export function buildBottomAdder(state: EditorState): Instance {
    const open$ = signal<boolean>(false);
    const trigger = toolButton({
        name: "plus-circle",
        label: "Add new",
        active$: () => open$(),
        onClick: () => open$.set(!open$()),
    });
    trigger.toggleClass(TRIGGER_CLASS, true);
    const popover = div(baseProps([POPOVER_CLASS]));
    popover.trackDispose(
        effect(() => {
            popover.toggleClass(POPOVER_OPEN_CLASS, open$());
            popover.setChildren();
            if (!open$()) return;
            for (const entry of KIND_ENTRIES) {
                const row = div(baseProps(["clans-home__bottom-adder-row"]), [
                    buildKindButton(state, entry, open$),
                    span(textProps([LABEL_CLASS], entry.label)),
                ]);
                popover.addChild(row);
            }
        }),
    );
    return div(baseProps([ADDER_CLASS]), [trigger, popover]);
}
