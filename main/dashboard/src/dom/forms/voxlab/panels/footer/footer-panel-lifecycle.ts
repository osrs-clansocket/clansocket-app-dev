import type { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { orderedSectionsOf, sectionsOf } from "./footer-panel-accessors.js";
import type { FooterPanelSections } from "./footer-panel-types.js";

const LIFECYCLE_GROUPS = [
    "lightSections",
    "cameraSections",
    "sceneSections",
    "meshSections",
    "colorSections",
    "textureSections",
    "displaySections",
] as const;

function resetSectionGroups(groups: ReadonlyArray<ReadonlyArray<BaseVoxlabComponent>>): void {
    for (const group of groups) {
        for (const sec of group) {
            const candidate = sec as { reset?: () => void };
            if (typeof candidate.reset === "function") candidate.reset();
        }
    }
}

function unmountSectionGroups(groups: ReadonlyArray<ReadonlyArray<BaseVoxlabComponent>>): void {
    for (const group of groups) for (const sec of group) sec.unmount();
}

function allGroupsOf(s: FooterPanelSections): ReadonlyArray<ReadonlyArray<BaseVoxlabComponent>> {
    return LIFECYCLE_GROUPS.map((g) => sectionsOf(s, g));
}

export function resetFooterAll(s: FooterPanelSections): void {
    resetSectionGroups([orderedSectionsOf(s).map((x) => x.component), ...allGroupsOf(s)]);
}

export function unmountFooterAll(s: FooterPanelSections): void {
    for (const { component } of orderedSectionsOf(s)) component.unmount();
    unmountSectionGroups(allGroupsOf(s));
}
