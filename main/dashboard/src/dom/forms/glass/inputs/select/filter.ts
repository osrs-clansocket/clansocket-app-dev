import { input, wireInput, type Instance } from "../../../../factory/index.js";

const CLASS_SEARCH = "glass-select__search";
const CLASS_OPTION_HIDDEN = "glass-select__option--hidden";

export function applyFilter(needle: string, optionInsts: readonly Instance<HTMLButtonElement>[]): void {
    const lower = needle.toLowerCase().trim();
    for (const opt of optionInsts) {
        const txt = (opt.el.textContent ?? "").toLowerCase();
        const matches = lower.length === 0 || txt.includes(lower);
        opt.toggleClass(CLASS_OPTION_HIDDEN, !matches);
    }
}

export function buildSearchInput(optionInsts: readonly Instance<HTMLButtonElement>[]): Instance<HTMLInputElement> {
    const searchInp = input({
        classes: [CLASS_SEARCH],
        type: "text",
        placeholder: "Filter…",
        ariaLabel: "Filter options",
        autocomplete: "off",
        context: "filter the available options",
        meta: ["input"],
    });
    wireInput(searchInp.el, () => applyFilter(searchInp.el.value, optionInsts));
    return searchInp;
}
