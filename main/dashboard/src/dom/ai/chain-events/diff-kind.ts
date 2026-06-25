export const DIFF_CONTEXT = "context";
export const DIFF_ADD = "add";
export const DIFF_REMOVE = "remove";

export type DiffKind = typeof DIFF_CONTEXT | typeof DIFF_ADD | typeof DIFF_REMOVE;

export interface DiffLine {
    kind: DiffKind;
    text: string;
}
