export const COMPONENT_CLASS = "clans-home__component";
export const COMPONENT_IMAGE_CLASS = "clans-home__component-image";
export const TEXT_DISPLAY_CLASS = "clans-home__component-text";
export const TEXT_INPUT_CLASS = "clans-home__component-input";
export const SPACER_CLASS = "clans-home__component--editing";

export function variantClass(kind: string): string {
    return `clans-home__component--${kind}`;
}
