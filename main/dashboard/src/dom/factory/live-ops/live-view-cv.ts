type CvAutoHint = "row" | "card" | "panel" | undefined;

export type { CvAutoHint };

export function cvAutoClass(hint: CvAutoHint): string | null {
    if (hint === "row") return "cv-auto--row";
    if (hint === "card") return "cv-auto--card";
    if (hint === "panel") return "cv-auto--panel";
    return null;
}
