export const MD_TEXT_CLASS = "clans-manage__auto-hooks-preview-md-text";
export const MD_BOLD_CLASS = "clans-manage__auto-hooks-preview-md-bold";
export const MD_ITALIC_CLASS = "clans-manage__auto-hooks-preview-md-italic";
export const MD_CODE_CLASS = "clans-manage__auto-hooks-preview-md-code";
export const MD_LINK_CLASS = "clans-manage__auto-hooks-preview-md-link";
export const MD_BR_CLASS = "clans-manage__auto-hooks-preview-md-br";

export type Node =
    | { kind: "text"; text: string }
    | { kind: "bold"; text: string }
    | { kind: "italic"; text: string }
    | { kind: "code"; text: string }
    | { kind: "link"; text: string; url: string }
    | { kind: "emoji"; id: string; name: string; animated: boolean; url: string | null }
    | { kind: "br" };

export const BOLD_DELIM = "**";
export const ITALIC_DELIM = "*";
export const CODE_DELIM = "`";
export const NEWLINE = "\n";
export const LINK_OPEN = "[";
export const LINK_MID = "](";
export const LINK_CLOSE = ")";
export const EMOJI_OPEN = "<";
export const EMOJI_CLOSE = ">";
export const EMOJI_SEP = ":";
export const EMOJI_ANIMATED = "a";
export const SPACE = " ";
export const MAX_SHORTCODE_LENGTH = 32;
export const MIN_SHORTCODE_LENGTH = 2;
