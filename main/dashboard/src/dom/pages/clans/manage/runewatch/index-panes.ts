import { button, div, image, paragraph, baseProps, textProps } from "../../../../factory";
import { glassInput } from "../../../../forms/glass/inputs/glass-input.js";
import type { Instance } from "../../../../factory";
import { CARD_LIST_CLASS } from "./index-cards.js";

const BRAND_HEAD_CLASS = "clans-manage__runewatch-head";
const BRAND_ICON_CLASS = "clans-manage__runewatch-brand-icon";
const TOP_PANE_CLASS = "clans-manage__runewatch-top";
const BOTTOM_PANE_CLASS = "clans-manage__runewatch-bottom";
const HEADER_ROW_CLASS = "clans-manage__runewatch-header-row";
const HEADER_CLASS = "clans-manage__runewatch-header";
const EMPTY_CLASS = "clans-manage__runewatch-empty";
const EMPTY_GOOD_CLASS = "clans-manage__runewatch-empty--good";
const SEARCH_ROW_CLASS = "clans-manage__runewatch-search-row";
const REFRESH_BTN_CLASS = "clans-manage__runewatch-refresh";
const SENTINEL_CLASS = "clans-manage__runewatch-sentinel";

const BRAND_ICON_SRC = "/resources/clan/runewatch.webp";
const BRAND_TITLE = "RuneWatch";

export function brandHead(): Instance<HTMLElement> {
    const head = div(baseProps([BRAND_HEAD_CLASS]));
    head.addChild(
        image({ src: BRAND_ICON_SRC, alt: BRAND_TITLE, classes: [BRAND_ICON_CLASS], context: null, meta: null }),
    );
    return head;
}

export interface TopPaneKit {
    topPane: Instance;
    topList: Instance;
    topEmpty: Instance;
    refreshBtn: Instance<HTMLButtonElement>;
}

function buildTopHeader(onRefresh: () => void): { row: Instance; refreshBtn: Instance<HTMLButtonElement> } {
    const topHeader = paragraph(textProps([HEADER_CLASS], "Clan members on the runewatch list"));
    const refreshBtn: Instance<HTMLButtonElement> = button({
        classes: [REFRESH_BTN_CLASS],
        text: "Refresh now",
        context: "refresh runewatch list",
        meta: ["action", "audit"],
        onClick: onRefresh,
    });
    const row = div(baseProps([HEADER_ROW_CLASS]));
    row.setChildren(topHeader, refreshBtn);
    return { row, refreshBtn };
}

export function buildTopPane(onRefresh: () => void): TopPaneKit {
    const { row: topHeaderRow, refreshBtn } = buildTopHeader(onRefresh);
    const topList = div(baseProps([CARD_LIST_CLASS]));
    const topEmpty = paragraph({
        classes: [EMPTY_CLASS, EMPTY_GOOD_CLASS],
        text: "✓  No clan members are currently flagged.",
        hidden: "",
        context: null,
        meta: null,
    });
    const topPane = div(baseProps([TOP_PANE_CLASS]));
    topPane.setChildren(topHeaderRow, topList, topEmpty);
    return { topPane, topList, topEmpty, refreshBtn };
}

export interface BottomPaneKit {
    bottomPane: Instance;
    bottomList: Instance;
    bottomEmpty: Instance;
    sentinel: Instance;
}

function buildSearchRow(onSearchInput: (q: string) => void): Instance {
    const search = glassInput({
        placeholder: "Search rsn or reason…",
        context: "search runewatch cases",
        meta: ["input", "audit"],
        onInput: (e: Event) => onSearchInput((e.target as HTMLInputElement).value),
    });
    const searchRow = div(baseProps([SEARCH_ROW_CLASS]));
    searchRow.addChild(search);
    return searchRow;
}

export function buildBottomPane(onSearchInput: (q: string) => void): BottomPaneKit {
    const bottomHeader = paragraph(textProps([HEADER_CLASS], "Browse all runewatch cases"));
    const bottomHeaderRow = div(baseProps([HEADER_ROW_CLASS]));
    bottomHeaderRow.setChildren(bottomHeader);
    const searchRow = buildSearchRow(onSearchInput);
    const bottomList = div(baseProps([CARD_LIST_CLASS]));
    const bottomEmpty = paragraph({
        classes: [EMPTY_CLASS],
        text: "No cases match.",
        hidden: "",
        context: null,
        meta: null,
    });
    const sentinel = div(baseProps([SENTINEL_CLASS]));
    const bottomPane = div(baseProps([BOTTOM_PANE_CLASS]));
    bottomPane.setChildren(bottomHeaderRow, searchRow, bottomList, bottomEmpty);
    return { bottomPane, bottomList, bottomEmpty, sentinel };
}
